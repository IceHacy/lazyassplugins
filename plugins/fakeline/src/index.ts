import { findByProps, findByStoreName } from "@vendetta/metro";
import { instead, after } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";

const StatusStore = findByStoreName("StatusStore");
const UserSettingsProtoStore = findByStoreName("UserSettingsProtoStore");

storage.isEnabled ??= false;

if (storage.isEnabled) {
    UserSettingsProtoStore.getUserSettingsProto().status = {
        status: "online",
        desktop: true
    };
}

const patches = [
    instead("isOnline", StatusStore, () => true),
    after("getStatus", UserSettingsProtoStore, (args, res) => {
        if (storage.isEnabled) {
            res.desktop = true;
            res.status = "online";
        }
        return res;
    }),
    after("updateStatus", UserSettingsProtoStore, (args) => {
        storage.isEnabled = args[0].desktop === true && args[0].status === "online";
    })
];

export const onUnload = () => {
    for (const unpatch of patches) unpatch();
};
