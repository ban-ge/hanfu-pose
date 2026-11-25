import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

// Apply the same pixel curve to every angle; no resize, sharpening or generated detail.
struct Profile: Decodable {
    let saturation: Double
    let lift: Double
    let contrast: Double
}
struct FileTask: Decodable {
    let source: String
    let target: String
    let view: String
}
struct Task: Decodable {
    let id: String
    let profile: String
    let files: [FileTask]
    let state: String
}
func smooth(_ low: Double, _ high: Double, _ x: Double) -> Double {
    let t = min(1, max(0, (x - low) / (high - low)))
    return t * t * (3 - 2 * t)
}
let args = CommandLine.arguments
let folder = URL(fileURLWithPath: args[1])
let profiles = try JSONDecoder().decode([String: Profile].self, from: Data(contentsOf: folder.appendingPathComponent("profiles.json")))
let tasks = try JSONDecoder().decode([Task].self, from: Data(contentsOf: folder.appendingPathComponent("tasks.json")))
let selected = Set(args.dropFirst(2))
let space = CGColorSpace(name: CGColorSpace.sRGB)!
var metrics = [[String: Any]]()
for task in tasks where selected.isEmpty || selected.contains(task.id) {
    precondition(task.state != "applied", "This batch is already installed; do not grade twice")
    let profile = profiles[task.profile]!
    for file in task.files {
        try autoreleasepool {
            let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: file.source) as CFURL, nil)!
            let input = CGImageSourceCreateImageAtIndex(source, 0, nil)!
            let width = input.width, height = input.height
            let count = width * height
            let bitmap = CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue
            var pixels = [UInt8](repeating: 0, count: count * 4)
            var changed = 0, alphaMismatch = 0, newClipped = 0
            var totalDelta = 0.0
            try pixels.withUnsafeMutableBytes { buffer in
                let context = CGContext(data: buffer.baseAddress, width: width, height: height, bitsPerComponent: 8, bytesPerRow: width * 4, space: space, bitmapInfo: bitmap)!
                context.draw(input, in: CGRect(x: 0, y: 0, width: width, height: height))
                let p = buffer.bindMemory(to: UInt8.self)
                // Corner background estimate protects the existing off-white backdrop.
                var bg = [0.0, 0.0, 0.0]
                var samples = 0.0
                for y in [2, height - 3] {
                    for x in [2, width / 2, width - 3] {
                        let k = (y * width + x) * 4
                        if p[k + 3] > 250 {
                            for c in 0..<3 { bg[c] += Double(p[k + c]) / 255 }
                            samples += 1
                        }
                    }
                }
                if samples > 0 { bg = bg.map { $0 / samples } }
                for pixel in 0..<count {
                    let k = pixel * 4
                    let alpha = p[k + 3]
                    if alpha == 0 { continue }
                    let a = Double(alpha) / 255
                    let r = Double(p[k]) / 255 / a
                    let g = Double(p[k + 1]) / 255 / a
                    let b = Double(p[k + 2]) / 255 / a
                    let y = 0.2126 * r + 0.7152 * g + 0.0722 * b
                    let chroma = max(r, max(g, b)) - min(r, min(g, b))
                    let distance = sqrt(pow(r-bg[0],2) + pow(g-bg[1],2) + pow(b-bg[2],2))
                    let backgroundWeight = samples > 0 && y > 0.6 ? smooth(0.035, 0.20, distance) : 1
                    let weight = backgroundWeight * (1 - smooth(0.84, 0.98, y)) * smooth(0.012, 0.08, y)
                    let lift = weight * y * (1-y) * (4 * profile.lift + profile.contrast * (2*y-1))
                    let brightest = max(r,max(g,b))
                    let ceiling = max(brightest, 254.0/255)
                    let newY = y + min(lift, max(0, ceiling-brightest) * 0.75)
                    let boost = weight * (profile.saturation - 1) * (1 - 0.65 * chroma)
                    let deviations = [r-y, g-y, b-y]
                    // Softly approach the gamut boundary instead of flattening bright reds/golds.
                    var limit = 1000.0
                    for d in deviations {
                        if d > 0 { limit = min(limit, (ceiling-newY) / d) }
                        if d < 0 { limit = min(limit, -newY / d) }
                    }
                    let headroom = max(0, limit-1)
                    let saturation = 1 + (boost+headroom > 0 ? boost * headroom / (boost+headroom) : 0)
                    var differs = false
                    for c in 0..<3 {
                        let old = p[k+c]
                        let value = UInt8(max(0, min(255, (newY+saturation*deviations[c]) * a * 255)).rounded())
                        if value != old { differs = true }
                        if value == 255 && old < 255 { newClipped += 1 }
                        p[k+c] = value
                    }
                    if differs { changed += 1 }
                    if p[k+3] != alpha { alphaMismatch += 1 }
                    totalDelta += newY-y
                }
                let result = context.makeImage()!
                let target = URL(fileURLWithPath: file.target)
                try FileManager.default.createDirectory(at: target.deletingLastPathComponent(), withIntermediateDirectories: true)
                let output = CGImageDestinationCreateWithURL(target as CFURL, UTType.png.identifier as CFString, 1, nil)!
                CGImageDestinationAddImage(output, result, nil)
                guard CGImageDestinationFinalize(output) else { throw NSError(domain: "PNG write failed", code: 1) }
            }
            metrics.append(["id": task.id, "view": file.view, "width": width, "height": height,
                            "profile": task.profile, "changed_pixels": changed, "pixels": count,
                            "alpha_mismatch": alphaMismatch, "new_clipped_channels": newClipped,
                            "mean_luminance_lift": totalDelta / Double(count)])
        }
    }
    print("\(task.id): staged \(task.files.count) files (\(task.profile))")
    fflush(stdout)
}
let name = selected.isEmpty ? "metrics.json" : "sample-metrics.json"
try JSONSerialization.data(withJSONObject: metrics, options: [.prettyPrinted, .sortedKeys]).write(to: folder.appendingPathComponent(name))
