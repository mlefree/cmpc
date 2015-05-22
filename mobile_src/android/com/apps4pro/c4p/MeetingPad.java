package com.apps4pro.c4p;

import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
//import javax.net.ssl.*;
import org.apache.cordova.*;

public class MeetingPad extends CordovaActivity
{
    private static final String TAG = "C4PApgActivity";

    private SharedPreferences mPrefs = null;
    private boolean mAppsLoaded = false;

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        // If process is killed and user navigates to this actvity
        super.onCreate(savedInstanceState);
        Log.d(TAG, "onCreate()");

        mPrefs = getPreferences(Context.MODE_PRIVATE);
        mAppsLoaded = mPrefs.getBoolean("AppsLoaded", false);

        if (super.appView == null) {
            super.init();
        }

        // Set properties for activity

        // Enable app to keep running in background. (Boolean - default=true)
        super.setBooleanProperty("keepRunning", true);
        // Display a native loading dialog when loading app.  Format for value = "Title,Message".
        super.setStringProperty("loadingDialog", "Wait,Loading application ...");
        // Display a native loading dialog when loading sub-pages.  Format for value = "Title,Message".
        super.setStringProperty("loadingPageDialog", "Wait,Loading page ...");
        // Load a splash screen image from the resource drawable directory.
        super.setIntegerProperty("splashscreen", R.drawable.splash);
        // Set the background color.
        //super.setIntegerProperty("backgroundColor", Color.WHITE);
        // Time in msec to wait before triggering a timeout error when loading
        super.setIntegerProperty("loadUrlTimeoutValue", 60000);
        // URL to load if there's an error loading specified URL with loadUrl().
        super.setStringProperty("errorUrl", "file:///android_asset/www/error.html");

        if(	Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            //MLE doesn't compile for me
        	//super.appView.setWebContentsDebuggingEnabled(true);
        }

        Application app = getApplication();
        String appCacheDir = app.getDir("cache", Context.MODE_PRIVATE).getPath();

        WebSettings settings = super.appView.getSettings();
        settings.setAllowFileAccess(true);
        settings.setAppCacheMaxSize(1024 * 1024 * 10);
        settings.setAppCachePath(appCacheDir);
        settings.setAppCacheEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        settings.setDomStorageEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);

        // Clear cache if you want
        //super.appView.clearCache(true);

        /*
        // Create a trust manager that does not validate certificate chains
        TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                        return null;
                    }

                    public void checkClientTrusted(
                            java.security.cert.X509Certificate[] certs, String authType) {
                    }

                    public void checkServerTrusted(
                            java.security.cert.X509Certificate[] certs, String authType) {
                    }
                }
        };

        // Install the all-trusting trust manager
        try {
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
        } catch (Exception e) {
        }
        */

        // Load your application
        Log.d(TAG, "loadUrl('" + Config.getStartUrl() + "')");
        // Set by <content src="index.html" /> in config.xml
        super.loadUrl(Config.getStartUrl(), 5000);
        mAppsLoaded = true;
        //super.loadUrl("file:///android_asset/www/index.html")
        // Deactivate native long tap
        super.appView.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) {
                return true;
            }
        });
    }

    @Override
    protected void onRestart() {
        // After onStop if user navigates to this actvity
        super.onRestart();
        Log.d(TAG, "onRestart()");

    }

    @Override
    protected void onStart() {
        // After onCreate, or after onRestart
        super.onStart();
        Log.d(TAG, "onStart()");
    }

    @Override
    protected void onResume() {
        // After onStart, or after onPause if user returns to this actvity
        super.onResume();
        Log.d(TAG, "onResume()");
    }

    @Override
    protected void onPause() {
        // Another activity comes into the foreground
        super.onPause();
        Log.d(TAG, "onPause()");
        // Save internal state
        if (mPrefs != null) {
            SharedPreferences.Editor editor = mPrefs.edit();
            editor.putBoolean("AppsLoaded", mAppsLoaded);
            editor.commit();
        }
        // This activity can be then killed if another application with higher priority needs memory => no onStop or onDestroy event
    }

    @Override
    protected void onStop() {
        // This activity is no longer visible
        super.onStop();
        Log.d(TAG, "onStop()");
        // This activity can be then killed if another application with higher priority needs memory => no onDestroy event
    }

    @Override
    public void onDestroy() {
        // This activity is finishing or being destroyed by the system
        super.onDestroy();
        Log.d(TAG, "onDestroy()");
    }

    @Override
    public void onReceivedError(int errorCode, String description, String failingUrl) {
        Log.e(TAG, "onReceivedError() : " + errorCode + " - " + description + " - " + failingUrl
                + " => loadUrl('file:///android_asset/www/offline.html')");
        super.loadUrl("file:///android_asset/www/offline.html");
    }



    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        Log.d(TAG, "onSaveInstanceState()");
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        super.onRestoreInstanceState(savedInstanceState);
        Log.d(TAG, "onRestoreInstanceState()");
    }


    @Override
    protected void onNewIntent (Intent intent){
    	Log.d(TAG, "onNewIntent() : intent.getDataString()=" + intent.getDataString());
        if(intent.getDataString() != "" && intent.getDataString() != null) {
        	String url = intent.getDataString();
            Log.d(TAG, "sendJavascript : handleOpenURL('" + url + "')");
        	this.sendJavascript("handleOpenURL('" + url + "');");
        };
        super.onNewIntent(intent);
    }

    @Override
    public Object onMessage(String id, Object obj) {
    	Log.d(TAG, "onMessage() : id="+id);
        if (id.equals("onPageFinished")) {
            final Intent intent = getIntent();
            if (intent != null) {
                final String url = intent.getDataString();
                Log.d(TAG, "onMessage() : getIntent().getDataString()=" + url);
                if ((url != null) && (url != "")) {
                    Log.d(TAG, "sendJavascript : handleOpenURL('" + url + "')");
                    this.sendJavascript("handleOpenURL('" + url + "');");
                }
            }
        }
        return super.onMessage(id, obj);
    }
}

