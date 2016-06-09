import { EventEmitter } from 'events';

export default class Store extends EventEmitter {
  constructor(...args) {
    super(...args);
    this.items = [];
  }

  all() {
    return this.items;
  }

  get(id) {
    let items = this.find(this.getIdPredicate(id));
    return items.length > 0 ? items[0] : false;
  }

  find(predicate) {
    return predicate ? this.items.filter(predicate) : this.all();
  }

  exclude(predicate) {
    return this.find(predicate ? x => !predicate(x) : undefined);
  }

  getIdPredicate(item) {
    let id = item.id !== undefined ? item.id : item;
    return (x) => x.id === id;
  }

  set(item) {
    let items = this.exclude(this.getIdPredicate(item));

    items.push(item);
    this.items = items;

    this.emit('changed');
    this.emit('set', item);
  }

  remove(predicate) {
    this.items = this.exclude(predicate);
    this.emit('changed');
  }

  count(predicate) {
    return this.find(predicate).length;
  }
}
