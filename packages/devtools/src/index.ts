let isHooked = false;

const InitLog = unsafeWindow.console.log;
const InitSetInterval = unsafeWindow.setInterval;
const InitCloseWindow = unsafeWindow.close;
const InitFunctionConstructor = unsafeWindow.Function.prototype.constructor;

(<Any>unsafeWindow).logger = InitLog;

function hookedFunctionConstructor(...args: unknown[]) {
  if (args[0] == "debugger") {
    return function () {
      isHooked = true;
    };
  }
  return InitFunctionConstructor(...args);
}
unsafeWindow.Function.prototype.constructor = hookedFunctionConstructor;

function hookedSetInterval<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  ms?: number,
  ...args: TArgs
) {
  if (callback && callback.toString()) {
    const funString = callback.toString() as string;
    if (
      funString.includes("debugger") ||
      funString.includes("window.close") ||
      /\.ondevtool/i.test(funString)
    ) {
      isHooked = true;
      return -1;
    }
  }
  return InitSetInterval(callback, ms, ...args);
}
unsafeWindow.setInterval = hookedSetInterval as typeof setInterval;

function hookedCloseWindow() {
  if (isHooked) return void 0;
  InitCloseWindow();
}
unsafeWindow.close = hookedCloseWindow;
