import { useSyncExternalStore } from 'react';

export function CheckPage() {
  const page = useSyncExternalStore(subscribe, getSnapshot);
  return page;
}

function getSnapshot() {
    const item = localStorage.getItem("page");
    return item;
}

function subscribe(callback:EventListener) {
  // ...
  window.addEventListener('storage', callback);
    return () => {window.removeEventListener('storage',callback)};
}