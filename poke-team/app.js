const h = React.createElement;
const { useEffect, useMemo, useSyncExternalStore } = React;
const useStore = (sel) => useSyncExternalStore(Store.subscribe, () => sel(Store.get()));
const sprite = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const TYPES = ["all", "fire", "water", "grass", "electric", "psychic", "ghost", "dragon"];

const EmptyState = ({ icon, title, hint, children }) =>
  h("div", { className: "empty" }, h("div", { className: "empty-icon" }, icon),
    h("h3", null, title), h("p", null, hint), children);

const SkeletonCard = () => h("div", { className: "card" },
  h("div", { className: "skeleton img" }), h("div", { className: "skeleton line" }), h("div", { className: "skeleton btn" }));

function Card({ p }) {
  const inTeam = useStore((s) => s.team.some((t) => t.id === p.id));
  const full = useStore((s) => s.team.length >= 6);
  return h("div", { className: "card" },
    h("img", { src: sprite(p.id), alt: p.name, loading: "lazy" }),
    h("div", { className: "name" }, "#" + p.id + " " + cap(p.name)),
    h("button", { className: inTeam ? "btn on" : "btn", disabled: full && !inTeam,
      onClick: () => Store.toggleTeam(p) }, inTeam ? "Remove" : full ? "Team full" : "Add to team"));
}

function Grid() {
  const status = useStore((s) => s.status), error = useStore((s) => s.error);
  const pokemon = useStore((s) => s.pokemon), search = useStore((s) => s.search);
  const typeNames = useStore((s) => s.typeNames), typeStatus = useStore((s) => s.typeStatus);
  const list = useMemo(() => pokemon.filter((p) =>
    p.name.includes(search.toLowerCase().trim()) && (!typeNames || typeNames.includes(p.name))),
    [pokemon, search, typeNames]);

  if (status === "idle" || status === "loading" || typeStatus === "loading")
    return h("div", { className: "grid" }, Array.from({ length: 12 }, (_, i) => h(SkeletonCard, { key: i })));
  if (status === "error" || typeStatus === "error")
    return h(EmptyState, { icon: "⚠️", title: "Something went wrong", hint: error || "Please try again." },
      h("button", { className: "btn", onClick: Store.retry }, "Retry"));
  if (!list.length)
    return h(EmptyState, { icon: "🔍", title: "No Pokémon found", hint: "Try another name or type filter." },
      h("button", { className: "btn", onClick: () => { Store.setSearch(""); Store.setType("all"); } }, "Reset filters"));
  return h("div", { className: "grid" }, list.map((p) => h(Card, { key: p.id, p })));
}

function Controls() {
  const search = useStore((s) => s.search), type = useStore((s) => s.type);
  return h("div", { className: "controls" },
    h("input", { placeholder: "Search Pokémon…", value: search, onChange: (e) => Store.setSearch(e.target.value) }),
    h("select", { value: type, onChange: (e) => Store.setType(e.target.value) },
      TYPES.map((t) => h("option", { key: t, value: t }, t === "all" ? "All types" : cap(t)))));
}

function TeamPanel() {
  const team = useStore((s) => s.team);
  return h("aside", { className: "team" },
    h("div", { className: "team-head" }, h("h2", null, "My Team (" + team.length + "/6)"),
      team.length > 0 && h("button", { className: "link", onClick: Store.clearTeam }, "Clear")),
    team.length === 0
      ? h(EmptyState, { icon: "🎒", title: "Your team is empty", hint: "Add up to 6 Pokémon from the list." })
      : h("ul", null, team.map((t) => h("li", { key: t.id },
          h("img", { src: sprite(t.id), alt: t.name }), h("span", null, cap(t.name)),
          h("button", { className: "link", onClick: () => Store.toggleTeam(t) }, "✕")))));
}

function Header() {
  const count = useStore((s) => s.team.length);
  return h("header", null, h("h1", null, "Pokémon Team Builder"), h("span", { className: "badge" }, "Team: " + count + "/6"));
}

function App() {
  useEffect(() => { Store.loadPokemon(); }, []);
  return h("div", { className: "wrap" }, h(Header), h("main", null,
    h("section", null, h(Controls), h(Grid)), h(TeamPanel)));
}
ReactDOM.createRoot(document.getElementById("root")).render(h(App));
