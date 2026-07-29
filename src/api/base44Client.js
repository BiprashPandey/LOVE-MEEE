// Re-export storageClient to maintain compatibility across components
import { storageClient } from './storageClient';
export { storageClient };
export const base44 = storageClient;
export default storageClient;
