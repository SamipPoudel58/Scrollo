function main() {
  const board = document.getElementById('board');
  let currentURL = window.location.href;

  function adjustBoard(board) {
    chrome.storage.sync.get(['scrollo_positions'], function (result) {
      if (result && result.scrollo_positions) {
        const currentBoard = window.location.href.split('/')[4];
        if (result.scrollo_positions[currentBoard])
          board.scrollTo({
            left: result.scrollo_positions[currentBoard],
            behavior: 'smooth',
          });
      }
    });
  }

  function trackBoard(board) {
    let currentTimeout;

    board.addEventListener('scroll', () => {
      if (currentTimeout) clearTimeout(currentTimeout);
      currentTimeout = setTimeout(() => {
        const currentBoard = window.location.href.split('/')[4];

        chrome.storage.sync.get(['scrollo_positions'], function (result) {
          if (!result) return;
          if (result.scrollo_positions) {
            const positions = result.scrollo_positions;
            positions[currentBoard] = board.scrollLeft;
            chrome.storage.sync.set({ scrollo_positions: positions });
          } else {
            chrome.storage.sync.set({
              scrollo_positions: { [currentBoard]: board.scrollLeft },
            });
          }
        });
      }, 500);
    });
  }

  adjustBoard(board);
  trackBoard(board);

  var observer = new MutationObserver(function (_mutationRecords) {
    if (currentURL !== window.location.href) {
      currentURL = window.location.href;
      const freshBoard = document.getElementById('board');
      adjustBoard(freshBoard);
      trackBoard(freshBoard);
    }
  });

  observer.observe(board, { childList: true });
}

window.onload = function () {
  main();
};
