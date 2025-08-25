import React from "react";
import "./sortingvisualizer.css";

export default class SortingVisualizer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      array: [],
      isSorting: false,
      barColors: {},
      timeTaken: null,
      swaps: 0,
    };
  }

  componentDidMount() {
    this.resetArray();
  }

  resetArray() {
    const array = [];
    for (let i = 0; i < 100; i++) {
      array.push(randomIntFromInterval(5, 400));
    }
    this.setState({ array, barColors: {}, timeTaken: null, swaps: 0 });
  }

  async MergeSort() {
    if (this.state.isSorting) return;
    const array = this.state.array.slice();
    const animations = [];
    let swaps = { count: 0 };
    mergeSortWithAnimations(array, 0, array.length - 1, animations, swaps);
    await this.animateArray(animations, swaps.count);
  }

  async QuickSort() {
    if (this.state.isSorting) return;
    const array = this.state.array.slice();
    const animations = [];
    let swaps = { count: 0 };
    quickSortWithAnimations(array, 0, array.length - 1, animations, swaps);
    await this.animateArray(animations, swaps.count);
  }

  async BubbleSort() {
    if (this.state.isSorting) return;
    const array = this.state.array.slice();   
    const animations = [];
    let swaps = { count: 0 };
    bubbleSortWithAnimations(array, animations, swaps);
    await this.animateArray(animations, swaps.count);
  }

  async animateArray(animations, swapsCount) {
    this.setState({ isSorting: true, timeTaken: null, swaps: 0 });
    let array = this.state.array.slice();
    let barColors = {};
    const startTime = performance.now();
    let swaps = 0;
    for (let i = 0; i < animations.length; i++) {
      const [type, idx1, idx2, newValue] = animations[i];
      if (type === "compare") {
        barColors = { ...barColors, [idx1]: "red", [idx2]: "red" };
        this.setState({ barColors });
        await sleep(10);
        barColors = { ...barColors, [idx1]: "", [idx2]: "" };
        this.setState({ barColors });
      } else if (type === "swap" || type === "overwrite") {
        array[idx1] = newValue;
        barColors = { ...barColors, [idx1]: "green" };
        swaps++;
        this.setState({ array: array.slice(), barColors, swaps });
        await sleep(10);
        barColors = { ...barColors, [idx1]: "" };
        this.setState({ barColors });
      }
    }
    const endTime = performance.now();
    this.setState({
      isSorting: false,
      array,
      barColors: {},
      timeTaken: Math.round(endTime - startTime),
      swaps,
    });
  }

// Only show the changed part of render()
render() {
  const { array, barColors, timeTaken, swaps } = this.state;
  return (
    <div className="visualizer-container">
      <h2 style={{color: "#38bdf8", marginBottom: 24, letterSpacing: 1}}>Sorting Visualizer</h2>
      <div className="array-bars-wrapper">
        {array.map((value, index) => (
          <div
            className="array-bar"
            key={index}
            style={{
              height: `${value}px`,
              background: barColors[index]
                ? barColors[index]
                : "linear-gradient(180deg, #38bdf8, #0ea5e9)",
            }}
          ></div>
        ))}
      </div>
      <div>
        <button onClick={() => this.resetArray()} disabled={this.state.isSorting}>New Array</button>
        <button onClick={() => this.MergeSort()} disabled={this.state.isSorting}>Merge Sort</button>
        <button onClick={() => this.QuickSort()} disabled={this.state.isSorting}>Quick Sort</button>
        <button onClick={() => this.BubbleSort()} disabled={this.state.isSorting}>Bubble Sort</button>
      </div>
      <div className="stats">
  {timeTaken !== null && (
    <div>
      Time taken: {(timeTaken / 1000).toFixed(2)} s<br />
      Swaps/Overwrites: {swaps}
    </div>
  )}
</div>
    </div>
  );
}
}
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Merge Sort with animations
function mergeSortWithAnimations(array, start, end, animations, swaps) {
  if (start >= end) return;
  const mid = Math.floor((start + end) / 2);
  mergeSortWithAnimations(array, start, mid, animations, swaps);
  mergeSortWithAnimations(array, mid + 1, end, animations, swaps);
  mergeWithAnimations(array, start, mid, end, animations, swaps);
}

function mergeWithAnimations(array, start, mid, end, animations, swaps) {
  let left = array.slice(start, mid + 1);
  let right = array.slice(mid + 1, end + 1);
  let i = 0, j = 0, k = start;
  while (i < left.length && j < right.length) {
    animations.push(["compare", start + i, mid + 1 + j]);
    if (left[i] <= right[j]) {
      animations.push(["overwrite", k, null, left[i]]);
      array[k++] = left[i++];
      swaps.count++;
    } else {
      animations.push(["overwrite", k, null, right[j]]);
      array[k++] = right[j++];
      swaps.count++;
    }
  }
  while (i < left.length) {
    animations.push(["overwrite", k, null, left[i]]);
    array[k++] = left[i++];
    swaps.count++;
  }
  while (j < right.length) {
    animations.push(["overwrite", k, null, right[j]]);
    array[k++] = right[j++];
    swaps.count++;
  }
}

// Quick Sort with animations
function quickSortWithAnimations(array, low, high, animations, swaps) {
  if (low < high) {
    const pi = partition(array, low, high, animations, swaps);
    quickSortWithAnimations(array, low, pi - 1, animations, swaps);
    quickSortWithAnimations(array, pi + 1, high, animations, swaps);
  }
}

function partition(array, low, high, animations, swaps) {
  let pivot = array[high];
  let i = low;
  for (let j = low; j < high; j++) {
    animations.push(["compare", j, high]);
    if (array[j] < pivot) {
      animations.push(["swap", i, null, array[j]]);
      animations.push(["swap", j, null, array[i]]);
      [array[i], array[j]] = [array[j], array[i]];
      swaps.count += 2;
      i++;
    }
  }
  animations.push(["swap", i, null, array[high]]);
  animations.push(["swap", high, null, array[i]]);
  [array[i], array[high]] = [array[high], array[i]];
  swaps.count += 2;
  return i;
}

// Bubble Sort with animations
function bubbleSortWithAnimations(array, animations, swaps) {
  let n = array.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      animations.push(["compare", j, j + 1]);
      if (array[j] > array[j + 1]) {
        animations.push(["swap", j, null, array[j + 1]]);
        animations.push(["swap", j + 1, null, array[j]]);
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swaps.count += 2;
      }
    }
  }
}

