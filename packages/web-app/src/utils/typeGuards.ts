export type TypeCheck<V = unknown> = (value: V) => boolean;

export type UnknownObject = { [K: string]: unknown };

export type ObjectPropChecks<T extends object> = {
  [K in keyof T]: TypeCheck<UnknownObject>;
};

export function isObjectOf<T extends object>(
  propChecks: ObjectPropChecks<T>
): TypeCheck {
  const propCheckValues = Object.values<TypeCheck<UnknownObject>>(propChecks);

  return (value: unknown): value is T => {
    try {
      if (typeof value !== "object") return false;

      let obj = value as UnknownObject;

      return propCheckValues.some((check) => check(obj));
    } catch {
      return false;
    }
  };
}

export function isKeyedObjectOf<V>(checkValue: TypeCheck) {
  return (value: unknown): value is { [key: string]: V } => {
    try {
      if (typeof value !== "object") return false;

      let obj = value as UnknownObject;

      return Object.values(obj).every(checkValue);
    } catch {
      return false;
    }
  };
}

export function isArrayOf<T>(valueCheck: TypeCheck): TypeCheck {
  return (value: unknown): value is T[] => {
    try {
      if (!Array.isArray(value)) return false;
      if (value.length <= 0) return true;

      const entry = value[0] as unknown;

      return valueCheck(entry);
    } catch {
      return false;
    }
  };
}

export function isString(value: unknown): boolean {
  return typeof value === "string";
}

export const isArrayOfStrings = isArrayOf<string>(isString);

export function isDate(value: unknown): boolean {
  try {
    const date = new Date(value as any);

    // If the date object is invalid it
    // will return 'NaN' on getTime()
    // and NaN is never equal to itself.
    if (date.getTime() !== date.getTime()) return false; // eslint-disable-line no-self-compare

    return true;
  } catch {
    return false;
  }
}

export function isDateString(value: unknown): boolean {
  if (!isString(value)) return false;

  return isDate(value);
}
