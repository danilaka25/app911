import { Timestamp as FirestoreTimestamp } from '@react-native-firebase/firestore';
import { FirebaseApp } from 'firebase/app';

export interface FirestoreDoc {
    id: string;
    data: {
        format: string;
        id: string;
        rawValue: string;
        updatedAt: Date | FirestoreTimestamp;
    };
    exists: boolean;
    metadata: {
        metadata: [boolean, boolean];
    };
    ref: {
        documentPath: {
            _parts: string[];
        };
        firestore: {
            app: FirebaseApp;
            config: Record<string, unknown>;
            customUrlOrRegion: string;
            nativeModule: Record<string, unknown>;
            referencePath: unknown;
            settings: Record<string, unknown>;
            transactionHandler: unknown;
        };
    };
}
