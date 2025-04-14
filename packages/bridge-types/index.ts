export type BridgeEventResponse =
  | {
      type: "THEME_CHANGE";
      payload: "dark" | "light";
    }
  | {
      type: "IS_AVAILABLE";
      payload: boolean;
    }
  | {
      type: "IS_AUTHORIZED";
      payload: boolean;
    }
  | {
      type: "ASK_FOR_PERMISSIONS";
      payload: boolean;
    }
  | {
      type: "GET_STEPS";
      payload: {
        count: number;
        startTime: string;
        endTime: string;
      }[];
    };

export type BridgeEventRequest = BridgeEventResponse["type"];
