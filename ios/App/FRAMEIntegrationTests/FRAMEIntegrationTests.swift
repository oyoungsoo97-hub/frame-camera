import XCTest
import UIKit
import WebKit

@MainActor
final class FRAMEIntegrationTests: XCTestCase {
    var web: WKWebView!
    func findWeb(_ view: UIView) -> WKWebView? {
        if let web = view as? WKWebView { return web }
        for child in view.subviews { if let web = findWeb(child) { return web } }
        return nil
    }
    func boot() async throws {
        let deadline=Date().addingTimeInterval(30)
        while Date()<deadline {
            for scene in UIApplication.shared.connectedScenes {
                if let scene=scene as? UIWindowScene {
                    for window in scene.windows { if let found=findWeb(window) { web=found } }
                }
            }
            if let web, (try? await web.evaluateJavaScript("Boolean(document.querySelector('#cameraBtn')?.onclick)")) as? Bool == true { break }
            try await Task.sleep(nanoseconds:200_000_000)
        }
        XCTAssertNotNil(web,"The real app's WKWebView did not start")
        let url=try XCTUnwrap(Bundle(for:Self.self).url(forResource:"scenarios",withExtension:"js"))
        _ = try await web.evaluateJavaScript(String(contentsOf:url,encoding:.utf8)+"; void 0;")
    }
    func run(_ name:String) async throws {
        let result=try await web.callAsyncJavaScript("return await window.__frameQARun(name, 'ios');",arguments:["name":name],in:nil,contentWorld:.page)
        print("FRAME_QA \(name): \(String(describing:result))")
    }
    func testBundledAppAndNativePlugins() async throws { try await boot();try await run("boot");try await run("nativeFiles") }
    func testLanguagesAndLayout() async throws { try await boot();try await run("languages");try await run("layout") }
    func testRealPoseModelAndCalibration() async throws { try await boot();try await run("modelAndCalibration") }
    func testGalleryPersistenceAndDeletion() async throws {
        try await boot();try await run("capture");web.reload();
        try await Task.sleep(nanoseconds:500_000_000);try await boot();try await run("persistenceAndDelete")
    }
    func testStorageFailureWarning() async throws {
        try await boot();try await run("storageFailure");web.reload()
        try await Task.sleep(nanoseconds:500_000_000);try await boot()
    }
    func testStoreScreenshots() async throws {
        try await boot()
        let directory=FileManager.default.urls(for:.documentDirectory,in:.userDomainMask)[0]
        for language in ["de","en","ko"] {
            for scene in ["guide","poses"] {
                try await run("screenshot_\(language)_\(scene)")
                let window=try XCTUnwrap(web.window)
                let renderer=UIGraphicsImageRenderer(bounds:window.bounds)
                let image=renderer.image { _ in window.drawHierarchy(in:window.bounds,afterScreenUpdates:true) }
                let data=try XCTUnwrap(image.pngData())
                try data.write(to:directory.appendingPathComponent("FRAME-qa-\(language)-\(scene).png"))
                let attachment=XCTAttachment(image:image);attachment.name="\(language)-\(scene)";attachment.lifetime = .keepAlways;add(attachment)
            }
        }
    }

}
