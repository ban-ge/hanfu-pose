import Foundation
import CoreGraphics
import ImageIO

func readPixels(_ path: String) -> (Int, Int, [UInt8]) {
    let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil)!
    let image = CGImageSourceCreateImageAtIndex(source, 0, nil)!
    var pixels = [UInt8](repeating: 0, count: image.width * image.height * 4)
    pixels.withUnsafeMutableBytes { buffer in
        let context = CGContext(data: buffer.baseAddress, width: image.width, height: image.height, bitsPerComponent: 8,
                                bytesPerRow: image.width * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!,
                                bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue)!
        context.draw(image, in: CGRect(x: 0, y: 0, width: image.width, height: image.height))
    }
    return (image.width, image.height, pixels)
}
let folder = URL(fileURLWithPath: CommandLine.arguments[1])
let tasks = try JSONSerialization.jsonObject(with: Data(contentsOf: folder.appendingPathComponent("tasks.json"))) as! [[String: Any]]
var results = [[String: Any]]()
for task in tasks {
    for file in task["files"] as! [[String: String]] {
        autoreleasepool {
            let (w, h, before) = readPixels(file["source"]!)
            let (w2, h2, after) = readPixels(file["target"]!)
            precondition(w == w2 && h == h2, "Changed geometry: \(file["source"]!)")
            var alphaErrors = 0, maxDelta = 0, darkened = 0
            var maxHueError = 0.0
            for k in stride(from: 0, to: before.count, by: 4) {
                if before[k+3] != after[k+3] { alphaErrors += 1 }
                for c in 0..<3 { maxDelta = max(maxDelta, abs(Int(after[k+c])-Int(before[k+c]))) }
                if before[k+3] < 250 { continue }
                let ar = Double(before[k])/255, ag = Double(before[k+1])/255, ab = Double(before[k+2])/255
                let br = Double(after[k])/255, bg = Double(after[k+1])/255, bb = Double(after[k+2])/255
                let ya = 0.2126*ar + 0.7152*ag + 0.0722*ab
                let yb = 0.2126*br + 0.7152*bg + 0.0722*bb
                if yb < ya - 0.004 { darkened += 1 }
                if max(ar,max(ag,ab)) - min(ar,min(ag,ab)) > 0.10 {
                    let xr = ar-ya, xg = ag-ya, xb = ab-ya
                    let yr = br-yb, yg = bg-yb, yb2 = bb-yb
                    let norm = sqrt((xr*xr+xg*xg+xb*xb) * (yr*yr+yg*yg+yb2*yb2))
                    if norm > 0 {
                        let dot = xr*yr+xg*yg+xb*yb2
                        maxHueError = max(maxHueError, acos(min(1,max(-1,dot/norm))))
                    }
                }
            }
            precondition(alphaErrors == 0 && darkened == 0 && maxDelta <= 65 && maxHueError < 0.06,
                         "Pixel validation failed: \(file["source"]!) alpha=\(alphaErrors) dark=\(darkened) delta=\(maxDelta) hue=\(maxHueError)")
            results.append(["id": task["id"]!, "view": file["view"]!, "dimensions": [w,h], "alpha_errors": alphaErrors,
                            "darkened_pixels": darkened, "max_channel_delta": maxDelta, "max_hue_error_radians": maxHueError])
        }
    }
    print("\(task["id"]!): decoded pixels verified")
    fflush(stdout)
}
try JSONSerialization.data(withJSONObject: results, options: [.prettyPrinted, .sortedKeys]).write(to: folder.appendingPathComponent("pixel-verification.json"))
