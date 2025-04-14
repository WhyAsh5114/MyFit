import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Platform, useColorScheme } from "react-native";
import {
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
} from "react-native-health-connect";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import type { BridgeEventResponse } from "bridge-types";

export default function Index() {
  const webViewRef = useRef<WebView | null>(null);
  const webViewUri =
    process.env.EXPO_PUBLIC_WEBSITE_URI || "https://my-fit-v4.vercel.app";

  const deviceTheme = useColorScheme();
  const [canGoBack, setCanGoBack] = useState(false);

  const onAndroidBackPress = useCallback(() => {
    if (canGoBack) {
      webViewRef.current?.goBack();
      return true;
    }
    return false;
  }, [canGoBack]);

  useEffect(() => {
    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", onAndroidBackPress);
      return () => {
        BackHandler.removeEventListener(
          "hardwareBackPress",
          onAndroidBackPress
        );
      };
    }
  }, [onAndroidBackPress]);

  useEffect(() => {
    if (webViewRef.current) {
      const themeData = JSON.stringify({
        eventType: "THEME_CHANGE",
        payload: deviceTheme,
      });
      webViewRef.current.postMessage(themeData);
    }
  }, [webViewRef.current, deviceTheme]);

  useEffect(() => {
    initialize();
  }, []);

  function sendMessageToWebView(eventResponse: BridgeEventResponse) {
    webViewRef.current?.postMessage(JSON.stringify(eventResponse));
  }

  const onMessage = async (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    console.log(data);

    if (data === "IS_AVAILABLE") {
      const status = await getSdkStatus();
      sendMessageToWebView({
        type: "IS_AVAILABLE",
        payload: status === SdkAvailabilityStatus.SDK_AVAILABLE,
      });
    }

    if (data === "IS_AUTHORIZED") {
      const grantedPermissions = await getGrantedPermissions();
      const activeStepsPermissionGranted = grantedPermissions.some(
        (permission) => permission.recordType === "Steps"
      );
      sendMessageToWebView({
        type: "IS_AUTHORIZED",
        payload: activeStepsPermissionGranted,
      });
    }

    if (data === "ASK_FOR_PERMISSIONS") {
      let grantedPermissions = await getGrantedPermissions();
      let activeStepsPermissionGranted = grantedPermissions.some(
        (permission) => permission.recordType === "Steps"
      );
      if (activeStepsPermissionGranted) {
        sendMessageToWebView({
          type: "ASK_FOR_PERMISSIONS",
          payload: true,
        });
        return;
      }

      grantedPermissions = await requestPermission([
        { accessType: "read", recordType: "Steps" },
      ]);
      activeStepsPermissionGranted = grantedPermissions.some(
        (permission) => permission.recordType === "Steps"
      );
      sendMessageToWebView({
        type: "ASK_FOR_PERMISSIONS",
        payload: activeStepsPermissionGranted,
      });
    }

    if (data === "GET_STEPS") {
      const { records } = await readRecords("Steps", {
        timeRangeFilter: {
          operator: "between",
          startTime: new Date(
            new Date().setDate(new Date().getDate() - 7)
          ).toISOString(),
          endTime: new Date().toISOString(),
        },
      });
      sendMessageToWebView({
        type: "GET_STEPS",
        payload: records,
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#2f78ca" }}>
      <WebView
        ref={webViewRef}
        source={{ uri: webViewUri }}
        onMessage={onMessage}
        style={{ flex: 1 }}
        allowsBackForwardNavigationGestures
        onLoadProgress={(event) => {
          setCanGoBack(event.nativeEvent.canGoBack);
        }}
      />
    </SafeAreaView>
  );
}
