// ===== 事件总线 =====
export class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }

  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  off(event, cb) {
    if (!this.listeners[event]) return;
    if (!cb) {
      delete this.listeners[event];
      return;
    }
    this.listeners[event] = this.listeners[event].filter(f => f !== cb);
  }
}
