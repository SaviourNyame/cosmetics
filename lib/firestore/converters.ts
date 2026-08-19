import type {
  FirestoreDataConverter as ClientConverter,
  QueryDocumentSnapshot as ClientSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import type {
  FirestoreDataConverter as AdminConverter,
  QueryDocumentSnapshot as AdminSnapshot,
} from "firebase-admin/firestore";

/**
 * Generic converter factory: every document type in types/firestore.ts
 * carries its own `id` field, so the converter just merges the doc id into
 * the data on read and strips it back out on write. One factory covers all
 * ~25 collections instead of hand-writing a converter per collection.
 */
export function clientConverter<T extends { id: string }>(): ClientConverter<T> {
  return {
    toFirestore(data: T) {
      const rest: Partial<T> = { ...data };
      delete rest.id;
      return rest;
    },
    fromFirestore(snapshot: ClientSnapshot, options: SnapshotOptions): T {
      return { id: snapshot.id, ...snapshot.data(options) } as T;
    },
  };
}

export function adminConverter<T extends { id: string }>(): AdminConverter<T> {
  return {
    toFirestore(data: T) {
      const rest: Partial<T> = { ...data };
      delete rest.id;
      return rest;
    },
    fromFirestore(snapshot: AdminSnapshot): T {
      return { id: snapshot.id, ...snapshot.data() } as T;
    },
  };
}
