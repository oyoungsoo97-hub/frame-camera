package io.github.oyoungsoo97hub.framecamera;

import android.Manifest;
import android.webkit.WebView;
import android.content.pm.ActivityInfo;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.rule.GrantPermissionRule;
import org.junit.*;
import org.junit.runner.RunWith;
import androidx.lifecycle.Lifecycle;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class FrameIntegrationTest {
    @Rule public GrantPermissionRule cameraPermission=GrantPermissionRule.grant(Manifest.permission.CAMERA);
    private ActivityScenario<MainActivity> scenario;
    private WebView web;
    private String scenarios;
    @Before public void launch() throws Exception {
        try(java.io.InputStream input=InstrumentationRegistry.getInstrumentation().getContext().getAssets().open("scenarios.js")){
            java.io.ByteArrayOutputStream data=new java.io.ByteArrayOutputStream();byte[] buffer=new byte[8192];int n;while((n=input.read(buffer))!=-1)data.write(buffer,0,n);scenarios=data.toString("UTF-8");
        }
        scenario=ActivityScenario.launch(MainActivity.class);
        scenario.onActivity(a->web=a.getBridge().getWebView());
        waitFor("document.querySelector('#cameraBtn')?.onclick != null",30000);
        js(scenarios);
    }
    @After public void close(){if(scenario!=null)scenario.close();}
    private String js(String script) throws Exception {
        CountDownLatch latch=new CountDownLatch(1);AtomicReference<String> value=new AtomicReference<>();
        InstrumentationRegistry.getInstrumentation().runOnMainSync(()->web.evaluateJavascript(script,result->{value.set(result);latch.countDown();}));
        assertTrue("WebView JavaScript timeout",latch.await(60,TimeUnit.SECONDS));return value.get();
    }
    private void waitFor(String expression,long timeout) throws Exception {
        long end=System.currentTimeMillis()+timeout;
        while(System.currentTimeMillis()<end){if("true".equals(js("Boolean("+expression+")")))return;Thread.sleep(200);}
        fail("Timed out: "+expression+"; page="+js("document.body.innerText.slice(-3000)"));
    }
    private void run(String name) throws Exception {
        js("window.__qaResult=null;window.__frameQARun('"+name+"','android').then(v=>window.__qaResult={ok:true,value:v}).catch(e=>window.__qaResult={ok:false,error:String(e),stack:e.stack})");
        waitFor("window.__qaResult != null",90000);
        String result=js("window.__qaResult");System.out.println("FRAME_QA "+name+" "+result);
        assertTrue(result,result.contains("\"ok\":true"));
    }
    @Test public void bundledAppAndNativePlugins() throws Exception {run("boot");run("nativeFiles");}
    @Test public void languagesAndResponsiveLayouts() throws Exception {
        run("languages");run("layout");
        scenario.onActivity(a->a.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE));
        Thread.sleep(800);run("layout");
    }
    @Test public void realPoseModelAndMetricCalibration() throws Exception {run("modelAndCalibration");}
    @Test public void gallerySurvivesReloadAndDeletes() throws Exception {
        run("capture");js("window.__qaBeforeReload=true");
        InstrumentationRegistry.getInstrumentation().runOnMainSync(()->web.reload());
        waitFor("window.__qaBeforeReload !== true && document.querySelector('#cameraBtn')?.onclick != null",30000);
        js(scenarios);run("persistenceAndDelete");
    }
    @Test public void cameraStopsWhenAppEntersBackground() throws Exception {
        run("cameraStart");scenario.moveToState(Lifecycle.State.CREATED);Thread.sleep(500);
        scenario.moveToState(Lifecycle.State.RESUMED);run("cameraStopped");
    }
    @Test public void emulatedCameraStartsAndStops() throws Exception {run("camera");}
    @Test public void storageFailureKeepsExportablePhotoWithWarning() throws Exception {run("storageFailure");}
    @Test public void storeScreenshots() throws Exception {
        for(String language:new String[]{"de","en","ko"})for(String view:new String[]{"guide","poses"}){
            run("screenshot_"+language+"_"+view);
            android.graphics.Bitmap screenshot=InstrumentationRegistry.getInstrumentation().getUiAutomation().takeScreenshot();
            assertNotNull("Native screenshot unavailable",screenshot);
            java.io.File dir=InstrumentationRegistry.getInstrumentation().getTargetContext().getExternalFilesDir(null);
            try(java.io.FileOutputStream output=new java.io.FileOutputStream(new java.io.File(dir,"FRAME-qa-"+language+"-"+view+".png"))){
                assertTrue(screenshot.compress(android.graphics.Bitmap.CompressFormat.PNG,100,output));
            }finally{screenshot.recycle();}
        }
    }

}
