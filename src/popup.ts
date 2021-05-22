"use strict";

const radioMap: { [key: string]: [string, boolean] } = {
    '#blocked-yes': ['trackBlocked', true ],
    '#blocked-no': ['trackBlocked', false ],
    '#muted-yes': ['trackMuted', true ],
    '#muted-no': ['trackMuted', false ],
    '#private-yes': ['trackPrivate', true ],
    '#private-no': ['trackPrivate', false ],
    '#extension-yes': ['extensionOn', true ],
    '#extension-no': ['extensionOn', false ],
}


Object.keys(radioMap).forEach(key => {
    document.querySelector(key)!.addEventListener('change', () => {
        chrome.storage.sync.set({ [radioMap[key][0]]: radioMap[key][1] });
    });
});

chrome.storage.sync.get(['trackBlocked', 'trackMuted', 'trackPrivate', 'extensionOn'], (values: any) => {
    const blockedYesRadio = document.querySelector('#blocked-yes') as HTMLInputElement;
    const blockedNoRadio = document.querySelector('#blocked-no') as HTMLInputElement;
    const mutedYesRadio = document.querySelector('#muted-yes') as HTMLInputElement;
    const mutedNoRadio = document.querySelector('#muted-no') as HTMLInputElement;
    const privateYesRadio = document.querySelector('#private-yes') as HTMLInputElement;
    const privateNoRadio = document.querySelector('#private-no') as HTMLInputElement;
    const extensionYesRadio = document.querySelector('#extension-yes') as HTMLInputElement;
    const extensionNoRadio = document.querySelector('#extension-no') as HTMLInputElement;
    console.log(values);
    if (Object.keys(values).length === 0) {
        chrome.storage.sync.set({
            extensionOn: true,
            trackBlocked: true,
            trackMuted: true,
            trackPrivate: true,
        });
        blockedYesRadio.checked = true;
        blockedNoRadio.checked = false;
        mutedYesRadio.checked = true;
        mutedNoRadio.checked = false;
        privateYesRadio.checked = true;
        privateNoRadio.checked = false;
        extensionYesRadio.checked = true;
        extensionNoRadio.checked = false;
    } else {
        blockedYesRadio.checked = values.trackBlocked;
        blockedNoRadio.checked = !values.trackBlocked;
        mutedYesRadio.checked = values.trackMuted;
        mutedNoRadio.checked = !values.trackMuted;
        privateYesRadio.checked = values.trackPrivate;
        privateNoRadio.checked = !values.trackPrivate;
        extensionYesRadio.checked = values.extensionOn;
        extensionNoRadio.checked = !values.extensionOn;
    }
});