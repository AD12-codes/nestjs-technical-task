export abstract class BaseEntity<T> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  get id(): T {
    return this._id;
  }

  equals(entity?: BaseEntity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (!(entity instanceof this.constructor)) {
      return false;
    }

    return this._id === entity._id;
  }
}
