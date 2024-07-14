import { findByProps } from "@vendetta/metro";
import { Forms, Navigation } from "@vendetta/ui";
import { storage } from "@vendetta/plugin";
import { React } from "@vendetta/metro/common";

const { openModal } = findByProps("openModal");

const YouTubeWindow: React.FC = () => {
    return (
        <Forms.Dialog title="YouTube">
            <iframe
                src="https://www.youtube.com/"
                style={{ width: "100%", height: "80vh", border: "none" }}
            />
        </Forms.Dialog>
    );
};

export const onLoad = () => {
    const YouTubeButton = () => (
        <Navigation.Button
            label="YouTube"
            icon="ic_video_24px"
            onPress={() => openModal(() => <YouTubeWindow />)}
        />
    );

    Navigation.add("YouTube", YouTubeButton);
};

export const onUnload = () => {
    Navigation.remove("YouTube");
};
