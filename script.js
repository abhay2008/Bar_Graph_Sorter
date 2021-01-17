const container = document.getElementById('container');

let n = 100;
let vals = shuffle(Array(n).fill().map((x, i) => i));
let states = Array(n).fill(0);

let currentSorter;
let stop = false;

function shuffle(arr) {
  const copy = [];
  let n = arr.length;
  let i;
  while (n) {
    i = Math.floor(Math.random() * arr.length);
    if (i in arr) {
      copy.push(arr[i]);
      delete arr[i];
      n--;
    }
  }
  return copy;
}

function swap(arr, i, j) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

/*--- BUBBLE SORT ---*/

function* bubbleSort() {
  for (let i = n - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      states[j] = 0;
      states[j + 1] = 1;
      states[j + 2] = 1;

      if (vals[j] > vals[j + 1]) {
        [vals[j], vals[j + 1]] = [vals[j + 1], vals[j]];
      }

      yield;
    }

    states[i] = 2;
    states[i + 1] = 2;
  }

  stop = true;
  yield;
}

/*--- SELECTION SORT ---*/

function* selectionSort() {
  for (let i = 0; i < n; i++) {
    let min = i;

    for (let j = i; j < n; j++) {
      states = states.map((x, k) => (k < i) ? 2 : 0);
      states[j] = 3;
      states[min] = 1;

      if (vals[j] < vals[min]) {
        min = j;
      }

      yield;
    }

    [vals[i], vals[min]] = [vals[min], vals[i]];
  }

  states.fill(2);
  stop = true;
  yield;
}

/*--- INSERTION SORT ---*/

function* insertionSort() {
  for (let i = 0; i < n - 1; i++) {
    states = states.map((x, k) => (k <= i) ? 2 : 0);

    for (let j = i + 1; j > 0; j--) {
      if (j <= i) states[j + 1] = 2;
      states[j] = 1;

      yield;

      if (vals[j] > vals[j - 1]) {
        break;
      } else {
        [vals[j], vals[j - 1]] = [vals[j - 1], vals[j]];
      }
    }
  }

  states.fill(2);
  stop = true;
  yield;
}

/*--- MERGE SORT ---*/

function* merge(lo1, hi1, lo2, hi2) {
  let left = lo1;
  let right = lo2;
  const merged = [];

  while (left < hi1 && right < hi2) {
    if (vals[left] < vals[right]) {
      merged.push(vals[left]);
      left++;
    } else {
      merged.push(vals[right]);
      right++;
    }
  }

  for (let i = left; i < hi1; i++) {
    merged.push(vals[i]);
  }

  for (let i = right; i < hi2; i++) {
    merged.push(vals[i]);
  }

  for (let i = lo1; i < hi2; i++) {
    vals[i] = merged[i - lo1];
    yield;
  }
}

function* mergeSort(lo, hi, first = true) {
  states.fill(0);

  if (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    yield* mergeSort(lo, mid, false);
    yield* mergeSort(mid, hi, false);
    yield* merge(lo, mid, mid, hi);
  }

  if (first) {
    states.fill(2);
    stop = true;
    yield;
  }
}

/*--- QUICKSORT ---*/

let p;

function* partition(lo, hi) {
  const pivot = vals[hi - 1];
  p = lo;

  for (let i = lo; i < hi; i++) {
    states = states.map(x => (x === 2 ? 2 : 0));
    states[lo] = 1;
    states[hi - 1] = 1;
    states[p] = 3;
    states[i] = 3;

    yield;

    if (vals[i] < pivot) {
      [vals[p], vals[i]] = [vals[i], vals[p]];
      p++;
    }
  }

  [vals[p], vals[hi - 1]] = [vals[hi - 1], vals[p]];
  states[p] = 2;
  yield;
}

function* quicksort(lo, hi, first = true) {
  if (lo < hi) {
    yield* partition(lo, hi);
    yield* quicksort(lo, p, false);
    yield* quicksort(p + 1, hi, false);
  }

  if (first) {
    stop = true;
    yield;
  }
}

/*--- HEAP SORT ---*/

function* maxHeapify(heapSize, parent, buildingHeap) {
  for (let i = 0; i < heapSize; i++) {
    states[i] = Math.floor(Math.log2(i + 1)) + 5;
  }

  const left = 2 * parent + 1;
  const right = 2 * parent + 2;
  let largest = parent;
  if (left < heapSize && vals[left] > vals[largest]) {
    largest = left;
  }
  if (right < heapSize && vals[right] > vals[largest]) {
    largest = right;
  }

  if (!buildingHeap) {
    states[parent] = 1;
    states[largest] = 1;
  }
  yield;

  if (largest !== parent) {
    [vals[parent], vals[largest]] = [vals[largest], vals[parent]];
    yield* maxHeapify(heapSize, largest, buildingHeap);
  }
}

function* buildHeap() {
  for (let i = 0; i < n; i++) {
    states[i] = Math.floor(Math.log2(i + 1)) + 5;
  }
  yield;

  for (let i = Math.floor(n / 2); i >= 0; i--) {
    yield* maxHeapify(n, i, true);
  }
}

function* heapSort() {
  let heapSize = n;
  yield* buildHeap();

  while (heapSize > 0) {
    [vals[0], vals[heapSize - 1]] = [vals[heapSize - 1], vals[0]];
    states[heapSize - 1] = 2;
    heapSize--;
    yield;
    yield* maxHeapify(heapSize, 0, false);
  }

  stop = true;
  yield;
}

/*--- SHELL SORT ---*/

function* gapInsertionSort(k) {
  for (let i = k; i < n; i++) {
    states.fill(0);

    for (let j = i; j >= k; j -= k) {
      if (j <= i) states[j + k] = 0;
      states[j] = 1;

      yield;

      if (vals[j] > vals[j - k]) {
        break;
      } else {
        [vals[j], vals[j - k]] = [vals[j - k], vals[j]];
      }
    }
  }
}

function* shellSort() {
  const gaps = [701, 301, 132, 57, 23, 10, 4, 1];

  for (let k of gaps) {
    if (k < n) {
      yield* gapInsertionSort(k);
    }
  }

  states.fill(2);
  stop = true;
  yield;
}

/*--- RADIX SORT ---*/

function* countingSort(converter) {
  const buckets = [];
  for (let val of vals) {
    const conv = converter(val);
    if (buckets[conv]) {
      buckets[conv].push(val);
    } else {
      buckets[conv] = [val];
    }
  }

  let i = 0;
  for (let bucket of buckets) {
    for (let val of bucket) {
      states[i - 1] = 0;
      states[i] = 1;
      vals[i] = val;
      yield;

      i++;
    }
  }
}

function numToString(num, len, radix) {
  let r = num.toString(radix);
  while (r.length < len) {
    r = '0' + r;
  }
  return r;
}

function* radixSort(radix = 10) {
  const len = n.toString(radix).length;

  for (let i = len - 1; i >= 0; i--) {
    yield* countingSort(x =>
      Number(numToString(x, len, radix).charAt(i))
    );
  }

  states.fill(2);
  stop = true;
  yield;
}

/* TREE SORT */



function updateDOM() {
  if (currentSorter) currentSorter.next();

  container.innerHTML = '';
  for (let i in vals) {
    const bar = document.createElement('DIV');
    bar.style.backgroundColor = '#333333';
    if (states[i] === 1) bar.style.backgroundColor = '#880000';
    if (states[i] === 2) bar.style.backgroundColor = '#008800';
    if (states[i] === 3) bar.style.backgroundColor = '#000088';
    if (states[i] === 4) bar.style.backgroundColor = '#008888';

    if (states[i] === 5) bar.style.backgroundColor = '#888800';
    if (states[i] === 6) bar.style.backgroundColor = '#880088';
    if (states[i] === 7) bar.style.backgroundColor = '#884400';
    if (states[i] === 8) bar.style.backgroundColor = '#884444';
    if (states[i] === 9) bar.style.backgroundColor = '#444488';
    if (states[i] === 10) bar.style.backgroundColor = '#448844';
    if (states[i] === 11) bar.style.backgroundColor = '#884488';
    if (states[i] === 12) bar.style.backgroundColor = '#448888';
    if (states[i] === 13) bar.style.backgroundColor = '#222288';
    if (states[i] === 14) bar.style.backgroundColor = '#882222';

    bar.style.width = (720 / n) + 'px';
    bar.style.height = (vals[i] * 540 / n) + 'px';
    bar.style.position = 'absolute';
    bar.style.bottom = '8px';
    bar.style.left = (i * 720 / n + 8) + 'px';
    container.appendChild(bar);
  }
}

updateDOM();
document.getElementById('shuffle').onclick = function () {
  n = Number(document.getElementById('elts').value);
  vals = shuffle(Array(n).fill().map((x, i) => i));
  states = Array(n).fill(0);
  updateDOM();
}
document.getElementById('sort').onclick = function () {
  stop = false;
  const algo = document.getElementById('algo').value;
  switch (algo) {
    case 'Quicksort':
      currentSorter = quicksort(0, n);
      break;
    case 'Merge Sort':
      currentSorter = mergeSort(0, n);
      break;
    case 'Heap Sort':
      currentSorter = heapSort();
      break;
    case 'Insertion Sort':
      currentSorter = insertionSort();
      break;
    case 'Selection Sort':
      currentSorter = selectionSort();
      break;
    case 'Bubble Sort':
      currentSorter = bubbleSort();
      break;
    case 'Shell Sort':
      currentSorter = shellSort();
      break;
    case 'Radix Sort':
      currentSorter = radixSort();
      break;
  }
  function step() {
    updateDOM();
    if (!stop) setTimeout(step, 1000 / Number(document.getElementById('fr').value));
  }
  step();
}
document.getElementById('stop').onclick = function () {
  stop = true;
}
