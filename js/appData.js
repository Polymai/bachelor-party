(() => {
  const TABLE = 'app_data';

  function envAppId() {
    return window.__ENV__ && window.__ENV__.appId ? window.__ENV__.appId : null;
  }

  async function uid() {
    const user = await window.SupabaseClient.getUser();
    return user ? user.id : null;
  }

  function base() {
    const sb = window.SupabaseClient.getSupabase();
    return sb.from(TABLE);
  }

  async function insert(type, payload) {
    const appId = envAppId();
    const userId = await uid();
    if (!appId) throw new Error('Missing app_id');
    if (!userId) throw new Error('Not signed in');

    const row = {
      app_id: appId,
      type,
      payload,
      created_by: userId
    };

    const { data, error } = await base().insert(row).select('id,app_id,type,payload,created_at,created_by').single();
    if (error) throw error;
    return data;
  }

  async function updateById(id, type, payload) {
    const appId = envAppId();
    const userId = await uid();
    if (!appId) throw new Error('Missing app_id');
    if (!userId) throw new Error('Not signed in');

    const { data, error } = await base()
      .update({ type, payload })
      .eq('id', id)
      .eq('app_id', appId)
      .eq('created_by', userId)
      .select('id,app_id,type,payload,created_at,created_by')
      .single();

    if (error) throw error;
    return data;
  }

  async function removeById(id) {
    const appId = envAppId();
    const userId = await uid();
    if (!appId) throw new Error('Missing app_id');
    if (!userId) throw new Error('Not signed in');

    const { error } = await base().delete().eq('id', id).eq('app_id', appId).eq('created_by', userId);
    if (error) throw error;
    return true;
  }

  async function listByType(type, opts = {}) {
    const appId = envAppId();
    if (!appId) throw new Error('Missing app_id');
    const limit = typeof opts.limit === 'number' ? opts.limit : 200;
    const asc = !!opts.asc;

    let q = base()
      .select('id,app_id,type,payload,created_at,created_by')
      .eq('app_id', appId)
      .eq('type', type)
      .limit(limit);

    q = asc ? q.order('created_at', { ascending: true }) : q.order('created_at', { ascending: false });

    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  async function getById(id) {
    const appId = envAppId();
    if (!appId) throw new Error('Missing app_id');
    const { data, error } = await base()
      .select('id,app_id,type,payload,created_at,created_by')
      .eq('app_id', appId)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  window.AppData = { insert, updateById, removeById, listByType, getById };
})();