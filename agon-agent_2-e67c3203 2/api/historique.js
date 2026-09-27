import { handlerFor } from './_crud.js';
export default handlerFor('historique', { order: 'created_at', asc: false, limit: 500 });
