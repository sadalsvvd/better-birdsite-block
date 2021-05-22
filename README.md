# Better Birdsite Block Chrome Extension

Twitter apparently has no idea what the semantics or intended purpose of "blocking" someone is, and shows contextual replies from accounts you've blocked (as well as muted or private accounts):

![](https://i.imgur.com/n6Zg1vn.png)

Better Birdsite Blocker (BBB) is a Chrome extension that hides those replies from you, making your timeline look like this:

![](https://i.imgur.com/4WPA6c8.png)

Finally, an _actual_ block.

## Installation

## Usage

Once installed, Better Birdsite is on by default. To customize options, click on the Better Birdsite Blocker icon (you may need to select the gear icon to show a list of all available extensions):

![](https://i.imgur.com/hu1Z6fR.png)

Turning the extension off will disable all functionality without affecting your settings, useful if you temporarily want to disable the functionality. (If you want to permanently disable it, just uninstall the extension.)

# Edge cases

## Mobile

As Better Birdsite Blocker is a Chrome extension and the Twitter app is a native mobile app, there is no way to get this functionality on Twitter mobile. Complain to the Twitter devs.

## Quote tweets

This extension currently does not hide quote tweets of blocked or muted account because Twitter simply shows the tweet as "This tweet is unavailable", and upon clicking through it could be because the user is blocked, muted, has you blocked, or simply Twitter didn't feel like rendering the quote tweet for whatever reason.

## Unblocked-blocked-unblocked thread bug

There is currently a bug where if you click into a reply to a blocked/muted/privated account that is itself replying to another non-blocked/muted/privated account, the extension will hide the tweet being replied to and all subsequent replies.

For example, in the tweet below, you would ONLY see the top tweet:

![](https://i.imgur.com/AR0up1P.png)

This shouldn't occur frequently since you won't see replies to blocked/muted/private users anyway on the main timeline, but if it does you can turn off the extension and refresh.