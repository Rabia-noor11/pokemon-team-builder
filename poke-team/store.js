// Global state: a tiny Zustand-style store (works with React's useSyncExternalStore)
const Store = (() => {
  const API = "https://pokeapi.co/api/v2";
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem("team") || "[]"); } catch (e) {}
  let state = { pokemon: [], status: "idle", error: null, search: "", type: "all",
                typeNames: null, typeStatus: "idle", team: saved };
  const subs = new Set();
  const get = () => state;
  const set = (p) => { state = { ...state, ...p }; subs.forEach((f) => f()); };
  const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };

  async function loadPokemon() {
    set({ status: "loading", error: null });
    try {
      const res = await fetch(`${API}/pokemon?limit=151`);
      if (!res.ok) throw new Error("Could not load Pokémon (" + res.status + ")");
      const data = await res.json();
      set({ status: "success", pokemon: data.results.map((r) => ({
        name: r.name, id: Number(r.url.split("/").filter(Boolean).pop()) })) });
    } catch (e) { set({ status: "error", error: e.message }); }
  }

  async function setType(type) {
    set({ type, typeNames: null, typeStatus: type === "all" ? "idle" : "loading" });
    if (type === "all") return;
    try {
      const res = await fetch(`${API}/type/${type}`);
      if (!res.ok) throw new Error("Could not load type filter");
      const data = await res.json();
      if (get().type === type)
        set({ typeStatus: "success", typeNames: data.pokemon.map((x) => x.pokemon.name) });
    } catch (e) { set({ typeStatus: "error", error: e.message }); }
  }

  function saveTeam(team) { set({ team }); try { localStorage.setItem("team", JSON.stringify(team)); } catch (e) {} }
  function toggleTeam(p) {
    const { team } = get();
    if (team.some((t) => t.id === p.id)) return saveTeam(team.filter((t) => t.id !== p.id));
    if (team.length < 6) saveTeam([...team, { id: p.id, name: p.name }]);
  }
  const retry = () => { loadPokemon(); setType(get().type); };

  return { get, subscribe, loadPokemon, setType, toggleTeam, retry,
           setSearch: (search) => set({ search }), clearTeam: () => saveTeam([]) };
})();
