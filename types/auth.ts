export interface RememberedAccount {
  rememberToken: string;
  rememberProfile: {
    id: string;
    email: string;
    displayName: string;
    avatar?: string;
    avatarViewUrl?: string;
    deviceId: string;
    deviceName?: string;
    savedAt: number; // timestamp
  };
}

export interface RememberedAccountInfoQuery {
  rememberToken: string;
  deviceId: string;
}

export interface RememberedAccountInfoResponse {
  success?: boolean;
  rememberProfile: {
    id: string;
    email: string;
    displayName: string;
    avatar?: string;
    avatarViewUrl?: string;
    deviceId: string;
    deviceName?: string;
    savedAt: number;
  };
  message?: string;
}

export interface RememberedLoginPayload {
  rememberToken: string;
  deviceId: string;
}

export interface RevokeRememberedAccountPayload {
  rememberToken: string;
  deviceId: string;
}
