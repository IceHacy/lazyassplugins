import { registerCommand } from "@vendetta/commands";
import { React } from "@vendetta/metro/common";
import { Dialog, useDialog } from "@vendetta/ui";

const YouTubeWindow: React.FC = () => {
    return (
        <Dialog title="YouTube">
            <iframe
                src="https://www.youtube.com/"
                style={{ width: "100%", height: "80vh", border: "none" }}
            />
        </Dialog>
    );
};

let command;

export const onLoad = () => {
    command = registerCommand({
        name: "youtube",
        displayName: "YouTube",
        description: "Open a YouTube window",
        type: 1,
        execute: () => {
            useDialog({ Component: YouTubeWindow });
        }
    });
};

export const onUnload = () => {
    command.unregister();
};
