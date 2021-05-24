// IIFE to deal with namespace collisions
(() => {
  const containsText = (selector: string, text: string) => {
    var elements = document.querySelectorAll(selector);
    return Array.prototype.filter.call(elements, function (element) {
      return RegExp(text).test(element.textContent);
    });
  }

  const findStyle = (el: HTMLElement, prop: string, value: any) => {
    // Get all leaf nodes, one of them has the background color
    var elms = Array.from(el.querySelectorAll('article div')).filter(x => x.children.length === 0);

    var matches: HTMLElement[] = [];

    // Loop through them
    Array.prototype.forEach.call(elms, function (elm) {
      // Get the color value
      var style = window.getComputedStyle(elm);
      // @ts-ignore
      if (style[prop] === value) {
        matches.push(elm);
      }
    });

    return matches;
  };

  // These contain the colors used by Twitter's UI that we use to find
  // tweet boundaries, edges, etc.
  const replyLines = [
    '196, 207, 214', // Default
    '61, 84, 102', // Dim
    '47, 51, 54', // Lights out
  ].map(x => `rgb(${x})`);

  const borders = [
    '235, 238, 240', // Default
    '56, 68, 77', // Dim
    '47, 51, 54', // Lights out
  ].map(x => `rgb(${x})`);
  let theme = -1;

  const hideReplyThreads = (triggerString: string) => {
    const checkForTweetBorder = (el: Element) => {
      var compStyle = window.getComputedStyle(el);

      if (borders.includes(compStyle.borderBottomColor)) {
        if (compStyle.borderBottomColor === borders[0]) {
          theme = 0;
        }
        if (compStyle.borderBottomColor === borders[1]) {
          theme = 1;
        }
        if (compStyle.borderBottomColor === borders[2]) {
          theme = 2;
        }

        return true;
      }
    };

    const censoredTweets = containsText('span', triggerString).filter(x => x.children.length === 0)

    censoredTweets.forEach(censoredTweet => {
      let ctTopLevel = censoredTweet.closest('article[role="article"]').parentNode.parentNode.parentNode;

      // Next, iterate through siblings until we find a fucking border (yes seriously lol), delete all tweets in between
      let elsToRemove = [ctTopLevel];
      let foundEdge = false;
      while (!foundEdge) {
        let lastEl = elsToRemove[elsToRemove.length - 1];

        // SOMETHING WENT WRONG
        let nextEl = lastEl.nextElementSibling;
        if (!nextEl) {
          // throw new Error('Something went wrong trying to tweet thread boundary');
          return;
        }
        //

        let child = nextEl.firstElementChild;
        const hasBorder = checkForTweetBorder(child);
        if (hasBorder) {
          foundEdge = true;
        }
        elsToRemove.push(nextEl);
      }

      // TODO: Handle edge cases where clicking into a reply to a priv/muted/blocked
      // account hides everything when it is the only context
      // let foundPreviousEdge;
      // while (!foundPreviousEdge) {

      // }

      
      // let foundFirst = false;
      // let prevEl = ctTopLevel.previousElementSibling;
      // while (!foundFirst) {
      //     if (!prevEl.previousElementSibling) {
      //         foundFirst = true;
      //     } else {
      //         prevEl = prevEl.previousElementSibling;
      //     }
      // }
      // console.log('firstEl:', prevEl);

      // Add border to previous tweet to make this seem continuous
      var previous = ctTopLevel.previousElementSibling;
      previous.style.borderBottom = `1px solid ${borders[theme]}`;

      // Now deal with the "reply line" that shows below user's avatars
      var replyLine = findStyle(previous, 'backgroundColor', replyLines[theme]);
      replyLine.forEach(rl => rl.style.display = 'none');

      // Remove all els
      elsToRemove.forEach(x => x.style.display = 'none');
    });
  };

  const getSettings = async (): Promise<Settings> => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['trackBlocked', 'trackMuted', 'trackPrivate', 'extensionOn'], (values) => {
        resolve(values as Settings);
      });
    });
  };

  // @TODO: Figure out how to deal with in-thread tweets, various contexts, etc.

  const TIMEOUT = 100;

  // Literally NO idea why this won't work as a promise, ugly as hell code as a result
  const waitForMain = (settings: Settings) => {
    // Extension is off, nothing to do.
    if (!settings.extensionOn) {
      return;
    }

    const main = document.querySelector('[data-testid="primaryColumn"]');
    if (main !== null) {
      const container = main.firstElementChild;
      if (container) {
        const containerChildren = container.children;
        if (containerChildren) {
          let timeline: Element | null = null;
  
          // Public TL has 4 children
          if (containerChildren.length === 4) {
            timeline = container.children[3];
          // In-context tweets have 2 children
          } else if (containerChildren.length === 2) {
            timeline = container.children[1];
          } else {
            // throw new Error('Don\'t know what to do with neither 4 nor 2 children in container')
            return;
          }

          censorTimeline(timeline, settings);
        } else {
          setTimeout(waitForMain.bind(undefined, settings), TIMEOUT);
        }
      } else {
        setTimeout(waitForMain.bind(undefined, settings), TIMEOUT);
      }
    } else {
      setTimeout(waitForMain.bind(undefined, settings), TIMEOUT);
    }
  };

  let lastMutation = Date.now();
  let lastCount = 0;
  let lastActedCount = 0;
  let censorInterval: number;
  const censorTimeline = (timeline: Element, settings: Settings) => {
    timeline.addEventListener('DOMNodeInserted', () => {
        lastMutation = Date.now();
        lastCount = timeline.children.length;
    });

    if (censorInterval) {
      clearInterval(censorInterval);
    }

    // Attempt to hide once TL has settled, within about 200ms
    censorInterval = setInterval(() => {
      lastCount = timeline.children.length;
      let countMismatch = lastCount !== lastActedCount;
      // TODO: Make this logic work, otherwise every 100ms is pretty minimal
      // if (countMismatch && Date.now() - lastMutation > TIMEOUT + 50) {
        lastActedCount = lastCount;
        if (settings.trackBlocked) {
          hideReplyThreads('from an account you blocked');
        }
        if (settings.trackMuted) {
          hideReplyThreads('from an account you muted');
        }
        if (settings.trackPrivate) {
          hideReplyThreads('You’re unable to view this Tweet because this account owner limits who can view their Tweets.');
        }
      // }
    }, 100);
    // // @ts-ignore
    // const censorTimeline = (mutationList, observer) => {
    //   console.log('mtuation!');
    //   console.log(mutationList);
    //   console.log(observer);
    // };
    // document.addEventListener("DOMContentLoaded", function(event) { 
    //   console.log('domcontentloaded')
    //   // @ts-ignore
    //   const mo = new MutationObserver(censorTimeline, {
    //     childList: true
    //   });
    //   console.log(timeline);
    //   mo.observe(timeline);
    //   // const getMainDivCount = () => {
    //   //   main?.querySelectorAll('div');
    //   // }
    // });
  };

  getSettings().then(settings => {
    waitForMain(settings);
    window.addEventListener('popstate', function (event) {
      waitForMain(settings);
    });
  });

})();