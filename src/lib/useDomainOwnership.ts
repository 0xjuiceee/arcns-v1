import { useEffect, useState } from "react";

export function useDomainOwnership(resolver, domain) {
  const [data, setData] = useState({
    owner: null,
    loading: true,
    source: null
  });

  useEffect(() => {
    let active = true;

    async function run() {
      setData({ owner: null, loading: true });

      const result = await resolver.resolveDomain(domain);

      if (!active) return;

      setData({
        owner: result.owner,
        source: result.source,
        loading: false
      });
    }

    run();

    return () => { active = false; };
  }, [domain]);

  return data;
}
