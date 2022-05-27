export function locatePlayer(): Promise<HTMLVideoElement> {
  return new Promise((resolve) => {
    if (document.querySelector('video')) {
      return resolve(document.querySelector('video'));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector('video')) {
        resolve(document.querySelector('video'));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
