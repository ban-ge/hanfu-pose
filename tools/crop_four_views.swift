import Foundation
import ImageIO
import CoreGraphics

// ImageIO pixel coordinates start at the top left; no centered sips crop offset.
let args = CommandLine.arguments
let sourceURL = URL(fileURLWithPath: args[1])
let destination = URL(fileURLWithPath: args[2], isDirectory: true)
guard let source = CGImageSourceCreateWithURL(sourceURL as CFURL, nil),
      let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else { fatalError("Invalid source PNG") }
let splitX = args.count > 3 ? Int(args[3])! : image.width / 2
let splitY = args.count > 4 ? Int(args[4])! : image.height / 2
let inset = 6
try FileManager.default.createDirectory(at: destination, withIntermediateDirectories: true)
for (name, column, row) in [("front", 0, 0), ("diag", 1, 0), ("side", 0, 1), ("back", 1, 1)] {
    let left = (column == 0 ? 0 : splitX) + inset
    let top = (row == 0 ? 0 : splitY) + inset
    let right = (column == 0 ? splitX : image.width) - inset
    let bottom = (row == 0 ? splitY : image.height) - inset
    let target = destination.appendingPathComponent(name + ".png")
    guard !FileManager.default.fileExists(atPath: target.path) else { fatalError("Refusing to overwrite \(target.path)") }
    guard let crop = image.cropping(to: CGRect(x: left, y: top, width: right-left, height: bottom-top)),
          let writer = CGImageDestinationCreateWithURL(target as CFURL, "public.png" as CFString, 1, nil) else { fatalError("Crop failed") }
    CGImageDestinationAddImage(writer, crop, nil)
    guard CGImageDestinationFinalize(writer) else { fatalError("PNG write failed") }
}
