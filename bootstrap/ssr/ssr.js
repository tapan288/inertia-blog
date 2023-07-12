import { router, setupProgress } from "@inertiajs/core";
import "lodash.isequal";
import createServer from "@inertiajs/core/server";
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a2, b2) {
  return a2 != a2 ? b2 == b2 : a2 !== b2 || a2 && typeof a2 === "object" || typeof a2 === "function";
}
function subscribe(store2, ...callbacks) {
  if (store2 == null) {
    for (const callback of callbacks) {
      callback(void 0);
    }
    return noop;
  }
  const unsub = store2.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function compute_rest_props(props, keys) {
  const rest = {};
  keys = new Set(keys);
  for (const k2 in props)
    if (!keys.has(k2) && k2[0] !== "$")
      rest[k2] = props[k2];
  return rest;
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function ensure_array_like(array_like_or_iterator) {
  return (array_like_or_iterator == null ? void 0 : array_like_or_iterator.length) !== void 0 ? array_like_or_iterator : Array.from(array_like_or_iterator);
}
const _boolean_attributes = (
  /** @type {const} */
  [
    "allowfullscreen",
    "allowpaymentrequest",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "defer",
    "disabled",
    "formnovalidate",
    "hidden",
    "inert",
    "ismap",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "selected"
  ]
);
const boolean_attributes = /* @__PURE__ */ new Set([..._boolean_attributes]);
const void_element_names = /^(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;
function is_void(name2) {
  return void_element_names.test(name2) || name2.toLowerCase() === "!doctype";
}
const invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
function spread(args, attrs_to_add) {
  const attributes = Object.assign({}, ...args);
  if (attrs_to_add) {
    const classes_to_add = attrs_to_add.classes;
    const styles_to_add = attrs_to_add.styles;
    if (classes_to_add) {
      if (attributes.class == null) {
        attributes.class = classes_to_add;
      } else {
        attributes.class += " " + classes_to_add;
      }
    }
    if (styles_to_add) {
      if (attributes.style == null) {
        attributes.style = style_object_to_string(styles_to_add);
      } else {
        attributes.style = style_object_to_string(
          merge_ssr_styles(attributes.style, styles_to_add)
        );
      }
    }
  }
  let str = "";
  Object.keys(attributes).forEach((name2) => {
    if (invalid_attribute_name_character.test(name2))
      return;
    const value = attributes[name2];
    if (value === true)
      str += " " + name2;
    else if (boolean_attributes.has(name2.toLowerCase())) {
      if (value)
        str += " " + name2;
    } else if (value != null) {
      str += ` ${name2}="${value}"`;
    }
  });
  return str;
}
function merge_ssr_styles(style_attribute, style_directive) {
  const style_object = {};
  for (const individual_style of style_attribute.split(";")) {
    const colon_index = individual_style.indexOf(":");
    const name2 = individual_style.slice(0, colon_index).trim();
    const value = individual_style.slice(colon_index + 1).trim();
    if (!name2)
      continue;
    style_object[name2] = value;
  }
  for (const name2 in style_directive) {
    const value = style_directive[name2];
    if (value) {
      style_object[name2] = value;
    } else {
      delete style_object[name2];
    }
  }
  return style_object;
}
const ATTR_REGEX = /[&"]/g;
const CONTENT_REGEX = /[&<]/g;
function escape$1(value, is_attr = false) {
  const str = String(value);
  const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
  pattern.lastIndex = 0;
  let escaped = "";
  let last = 0;
  while (pattern.test(str)) {
    const i2 = pattern.lastIndex - 1;
    const ch = str[i2];
    escaped += str.substring(last, i2) + (ch === "&" ? "&amp;" : ch === '"' ? "&quot;" : "&lt;");
    last = i2 + 1;
  }
  return escaped + str.substring(last);
}
function escape_attribute_value(value) {
  const should_escape = typeof value === "string" || value && typeof value === "object";
  return should_escape ? escape$1(value, true) : value;
}
function escape_object(obj) {
  const result = {};
  for (const key in obj) {
    result[key] = escape_attribute_value(obj[key]);
  }
  return result;
}
function each(items, fn) {
  items = ensure_array_like(items);
  let str = "";
  for (let i2 = 0; i2 < items.length; i2 += 1) {
    str += fn(items[i2], i2);
  }
  return str;
}
const missing_component = {
  $$render: () => ""
};
function validate_component(component, name2) {
  if (!component || !component.$$render) {
    if (name2 === "svelte:component")
      name2 += " this={...}";
    throw new Error(
      `<${name2}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules. Otherwise you may need to fix a <${name2}>.`
    );
  }
  return component;
}
let on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      // these will be immediately discarded
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = /* @__PURE__ */ new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: /* @__PURE__ */ new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css) => css.code).join("\n"),
          map: null
          // TODO
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name2, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  const assignment = boolean && value === true ? "" : `="${escape$1(value, true)}"`;
  return ` ${name2}${assignment}`;
}
function style_object_to_string(style_object) {
  return Object.keys(style_object).filter((key) => style_object[key]).map((key) => `${key}: ${escape_attribute_value(style_object[key])};`).join(" ");
}
const subscriber_queue = [];
function readable(value, start) {
  return {
    subscribe: writable(value, start).subscribe
  };
}
function writable(value, start = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i2 = 0; i2 < subscriber_queue.length; i2 += 2) {
            subscriber_queue[i2][0](subscriber_queue[i2 + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set, update) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0 && stop) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function derived(stores, fn, initial_value) {
  const single = !Array.isArray(stores);
  const stores_array = single ? [stores] : stores;
  if (!stores_array.every(Boolean)) {
    throw new Error("derived() expects stores as input, got a falsy value");
  }
  const auto = fn.length < 2;
  return readable(initial_value, (set, update) => {
    let started = false;
    const values = [];
    let pending = 0;
    let cleanup = noop;
    const sync = () => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set, update);
      if (auto) {
        set(result);
      } else {
        cleanup = is_function(result) ? result : noop;
      }
    };
    const unsubscribers = stores_array.map(
      (store2, i2) => subscribe(
        store2,
        (value) => {
          values[i2] = value;
          pending &= ~(1 << i2);
          if (started) {
            sync();
          }
        },
        () => {
          pending |= 1 << i2;
        }
      )
    );
    started = true;
    sync();
    return function stop() {
      run_all(unsubscribers);
      cleanup();
      started = false;
    };
  });
}
const store = writable({
  component: null,
  layout: [],
  page: {},
  key: null
});
const h$1 = (component, props, children) => {
  return {
    component,
    ...props ? { props } : {},
    ...children ? { children } : {}
  };
};
const Render = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $store, $$unsubscribe_store;
  $$unsubscribe_store = subscribe(store, (value) => $store = value);
  let { component } = $$props;
  let { props = {} } = $$props;
  let { children = [] } = $$props;
  if ($$props.component === void 0 && $$bindings.component && component !== void 0)
    $$bindings.component(component);
  if ($$props.props === void 0 && $$bindings.props && props !== void 0)
    $$bindings.props(props);
  if ($$props.children === void 0 && $$bindings.children && children !== void 0)
    $$bindings.children(children);
  $$unsubscribe_store();
  return `${$store.component ? `${validate_component(component || missing_component, "svelte:component").$$render($$result, Object.assign({}, props), {}, {
    default: () => {
      return `${each(children, (child, index) => {
        return `${validate_component(Render, "svelte:self").$$render($$result, Object.assign({}, child), {}, {})}`;
      })}`;
    }
  })}` : ``}`;
});
const App = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let child;
  let layout;
  let components;
  let $store, $$unsubscribe_store;
  $$unsubscribe_store = subscribe(store, (value) => $store = value);
  child = $store.component && h$1($store.component.default, $store.page.props);
  layout = $store.component && $store.component.layout;
  components = layout ? Array.isArray(layout) ? layout.concat(child).reverse().reduce((child2, layout2) => h$1(layout2, $store.page.props, [child2])) : h$1(layout, $store.page.props, [child]) : child;
  $$unsubscribe_store();
  return `${validate_component(Render, "Render").$$render($$result, Object.assign({}, components), {}, {})}`;
});
const SSR = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { id, initialPage } = $$props;
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.initialPage === void 0 && $$bindings.initialPage && initialPage !== void 0)
    $$bindings.initialPage(initialPage);
  return `<div data-server-rendered="true"${add_attribute("id", id, 0)}${add_attribute("data-page", JSON.stringify(initialPage), 0)}>${validate_component(App, "App").$$render($$result, {}, {}, {})}</div>`;
});
async function createInertiaApp({ id = "app", resolve, setup, progress = {}, page }) {
  const isServer = typeof window === "undefined";
  const el = isServer ? null : document.getElementById(id);
  const initialPage = page || JSON.parse(el.dataset.page);
  const resolveComponent = (name2) => Promise.resolve(resolve(name2));
  await resolveComponent(initialPage.component).then((initialComponent) => {
    store.set({
      component: initialComponent,
      page: initialPage
    });
  });
  if (!isServer) {
    router.init({
      initialPage,
      resolveComponent,
      swapComponent: async ({ component, page: page2, preserveState }) => {
        store.update((current) => ({
          component,
          page: page2,
          key: preserveState ? current.key : Date.now()
        }));
      }
    });
    if (progress) {
      setupProgress(progress);
    }
    return setup({
      el,
      App,
      props: {
        initialPage,
        resolveComponent
      }
    });
  }
  if (isServer) {
    const { html, head } = SSR.render({ id, initialPage });
    return {
      body: html,
      head: [head]
    };
  }
}
const Link = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "href",
    "as",
    "data",
    "method",
    "replace",
    "preserveScroll",
    "preserveState",
    "only",
    "headers",
    "queryStringArrayFormat"
  ]);
  let { href } = $$props;
  let { as = "a" } = $$props;
  let { data = {} } = $$props;
  let { method = "get" } = $$props;
  let { replace = false } = $$props;
  let { preserveScroll = false } = $$props;
  let { preserveState = null } = $$props;
  let { only = [] } = $$props;
  let { headers = {} } = $$props;
  let { queryStringArrayFormat = "brackets" } = $$props;
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.as === void 0 && $$bindings.as && as !== void 0)
    $$bindings.as(as);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.method === void 0 && $$bindings.method && method !== void 0)
    $$bindings.method(method);
  if ($$props.replace === void 0 && $$bindings.replace && replace !== void 0)
    $$bindings.replace(replace);
  if ($$props.preserveScroll === void 0 && $$bindings.preserveScroll && preserveScroll !== void 0)
    $$bindings.preserveScroll(preserveScroll);
  if ($$props.preserveState === void 0 && $$bindings.preserveState && preserveState !== void 0)
    $$bindings.preserveState(preserveState);
  if ($$props.only === void 0 && $$bindings.only && only !== void 0)
    $$bindings.only(only);
  if ($$props.headers === void 0 && $$bindings.headers && headers !== void 0)
    $$bindings.headers(headers);
  if ($$props.queryStringArrayFormat === void 0 && $$bindings.queryStringArrayFormat && queryStringArrayFormat !== void 0)
    $$bindings.queryStringArrayFormat(queryStringArrayFormat);
  return `${((tag) => {
    return tag ? `<${as}${spread([escape_object(as === "a" ? { href } : {}), escape_object($$restProps)], {})}>${is_void(tag) ? "" : `${slots.default ? slots.default({}) : ``}`}${is_void(tag) ? "" : `</${tag}>`}` : "";
  })(as)}`;
});
derived(store, ($store) => $store.page);
const Home = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1 data-svelte-h="svelte-186kyn">Hello from Home</h1> ${validate_component(Link, "Link").$$render($$result, { href: route("welcome") }, {}, {
    default: () => {
      return `Welcome`;
    }
  })}`;
});
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Home
}, Symbol.toStringTag, { value: "Module" }));
let name = "world";
const Welcome = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { appName = "Laravel" } = $$props;
  if ($$props.appName === void 0 && $$bindings.appName && appName !== void 0)
    $$bindings.appName(appName);
  return `${$$result.head += `<!-- HEAD_svelte-oztjw9_START -->${$$result.title = `<title>Your page title | ${escape$1(appName)}</title>`, ""}<meta name="description" content="Your page description"><!-- HEAD_svelte-oztjw9_END -->`, ""} <h1>Hello ${escape$1(name)}!</h1> ${validate_component(Link, "Link").$$render($$result, { href: route("home") }, {}, {
    default: () => {
      return `Home`;
    }
  })}`;
});
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Welcome
}, Symbol.toStringTag, { value: "Module" }));
function t(t4, r2) {
  for (var n2 = 0; n2 < r2.length; n2++) {
    var e2 = r2[n2];
    e2.enumerable = e2.enumerable || false, e2.configurable = true, "value" in e2 && (e2.writable = true), Object.defineProperty(t4, "symbol" == typeof (o2 = function(t5, r3) {
      if ("object" != typeof t5 || null === t5)
        return t5;
      var n3 = t5[Symbol.toPrimitive];
      if (void 0 !== n3) {
        var e3 = n3.call(t5, "string");
        if ("object" != typeof e3)
          return e3;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return String(t5);
    }(e2.key)) ? o2 : String(o2), e2);
  }
  var o2;
}
function r(r2, n2, e2) {
  return n2 && t(r2.prototype, n2), e2 && t(r2, e2), Object.defineProperty(r2, "prototype", { writable: false }), r2;
}
function n() {
  return n = Object.assign ? Object.assign.bind() : function(t4) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var n2 = arguments[r2];
      for (var e2 in n2)
        Object.prototype.hasOwnProperty.call(n2, e2) && (t4[e2] = n2[e2]);
    }
    return t4;
  }, n.apply(this, arguments);
}
function e(t4) {
  return e = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t5) {
    return t5.__proto__ || Object.getPrototypeOf(t5);
  }, e(t4);
}
function o(t4, r2) {
  return o = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t5, r3) {
    return t5.__proto__ = r3, t5;
  }, o(t4, r2);
}
function i() {
  if ("undefined" == typeof Reflect || !Reflect.construct)
    return false;
  if (Reflect.construct.sham)
    return false;
  if ("function" == typeof Proxy)
    return true;
  try {
    return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    })), true;
  } catch (t4) {
    return false;
  }
}
function u(t4, r2, n2) {
  return u = i() ? Reflect.construct.bind() : function(t5, r3, n3) {
    var e2 = [null];
    e2.push.apply(e2, r3);
    var i2 = new (Function.bind.apply(t5, e2))();
    return n3 && o(i2, n3.prototype), i2;
  }, u.apply(null, arguments);
}
function f(t4) {
  var r2 = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
  return f = function(t5) {
    if (null === t5 || -1 === Function.toString.call(t5).indexOf("[native code]"))
      return t5;
    if ("function" != typeof t5)
      throw new TypeError("Super expression must either be null or a function");
    if (void 0 !== r2) {
      if (r2.has(t5))
        return r2.get(t5);
      r2.set(t5, n2);
    }
    function n2() {
      return u(t5, arguments, e(this).constructor);
    }
    return n2.prototype = Object.create(t5.prototype, { constructor: { value: n2, enumerable: false, writable: true, configurable: true } }), o(n2, t5);
  }, f(t4);
}
var a = String.prototype.replace, c = /%20/g, l = { default: "RFC3986", formatters: { RFC1738: function(t4) {
  return a.call(t4, c, "+");
}, RFC3986: function(t4) {
  return String(t4);
} }, RFC1738: "RFC1738", RFC3986: "RFC3986" }, s = Object.prototype.hasOwnProperty, v = Array.isArray, p = function() {
  for (var t4 = [], r2 = 0; r2 < 256; ++r2)
    t4.push("%" + ((r2 < 16 ? "0" : "") + r2.toString(16)).toUpperCase());
  return t4;
}(), y = function(t4, r2) {
  for (var n2 = r2 && r2.plainObjects ? /* @__PURE__ */ Object.create(null) : {}, e2 = 0; e2 < t4.length; ++e2)
    void 0 !== t4[e2] && (n2[e2] = t4[e2]);
  return n2;
}, d = { arrayToObject: y, assign: function(t4, r2) {
  return Object.keys(r2).reduce(function(t5, n2) {
    return t5[n2] = r2[n2], t5;
  }, t4);
}, combine: function(t4, r2) {
  return [].concat(t4, r2);
}, compact: function(t4) {
  for (var r2 = [{ obj: { o: t4 }, prop: "o" }], n2 = [], e2 = 0; e2 < r2.length; ++e2)
    for (var o2 = r2[e2], i2 = o2.obj[o2.prop], u2 = Object.keys(i2), f2 = 0; f2 < u2.length; ++f2) {
      var a2 = u2[f2], c2 = i2[a2];
      "object" == typeof c2 && null !== c2 && -1 === n2.indexOf(c2) && (r2.push({ obj: i2, prop: a2 }), n2.push(c2));
    }
  return function(t5) {
    for (; t5.length > 1; ) {
      var r3 = t5.pop(), n3 = r3.obj[r3.prop];
      if (v(n3)) {
        for (var e3 = [], o3 = 0; o3 < n3.length; ++o3)
          void 0 !== n3[o3] && e3.push(n3[o3]);
        r3.obj[r3.prop] = e3;
      }
    }
  }(r2), t4;
}, decode: function(t4, r2, n2) {
  var e2 = t4.replace(/\+/g, " ");
  if ("iso-8859-1" === n2)
    return e2.replace(/%[0-9a-f]{2}/gi, unescape);
  try {
    return decodeURIComponent(e2);
  } catch (t5) {
    return e2;
  }
}, encode: function(t4, r2, n2, e2, o2) {
  if (0 === t4.length)
    return t4;
  var i2 = t4;
  if ("symbol" == typeof t4 ? i2 = Symbol.prototype.toString.call(t4) : "string" != typeof t4 && (i2 = String(t4)), "iso-8859-1" === n2)
    return escape(i2).replace(/%u[0-9a-f]{4}/gi, function(t5) {
      return "%26%23" + parseInt(t5.slice(2), 16) + "%3B";
    });
  for (var u2 = "", f2 = 0; f2 < i2.length; ++f2) {
    var a2 = i2.charCodeAt(f2);
    45 === a2 || 46 === a2 || 95 === a2 || 126 === a2 || a2 >= 48 && a2 <= 57 || a2 >= 65 && a2 <= 90 || a2 >= 97 && a2 <= 122 || o2 === l.RFC1738 && (40 === a2 || 41 === a2) ? u2 += i2.charAt(f2) : a2 < 128 ? u2 += p[a2] : a2 < 2048 ? u2 += p[192 | a2 >> 6] + p[128 | 63 & a2] : a2 < 55296 || a2 >= 57344 ? u2 += p[224 | a2 >> 12] + p[128 | a2 >> 6 & 63] + p[128 | 63 & a2] : (a2 = 65536 + ((1023 & a2) << 10 | 1023 & i2.charCodeAt(f2 += 1)), u2 += p[240 | a2 >> 18] + p[128 | a2 >> 12 & 63] + p[128 | a2 >> 6 & 63] + p[128 | 63 & a2]);
  }
  return u2;
}, isBuffer: function(t4) {
  return !(!t4 || "object" != typeof t4 || !(t4.constructor && t4.constructor.isBuffer && t4.constructor.isBuffer(t4)));
}, isRegExp: function(t4) {
  return "[object RegExp]" === Object.prototype.toString.call(t4);
}, maybeMap: function(t4, r2) {
  if (v(t4)) {
    for (var n2 = [], e2 = 0; e2 < t4.length; e2 += 1)
      n2.push(r2(t4[e2]));
    return n2;
  }
  return r2(t4);
}, merge: function t2(r2, n2, e2) {
  if (!n2)
    return r2;
  if ("object" != typeof n2) {
    if (v(r2))
      r2.push(n2);
    else {
      if (!r2 || "object" != typeof r2)
        return [r2, n2];
      (e2 && (e2.plainObjects || e2.allowPrototypes) || !s.call(Object.prototype, n2)) && (r2[n2] = true);
    }
    return r2;
  }
  if (!r2 || "object" != typeof r2)
    return [r2].concat(n2);
  var o2 = r2;
  return v(r2) && !v(n2) && (o2 = y(r2, e2)), v(r2) && v(n2) ? (n2.forEach(function(n3, o3) {
    if (s.call(r2, o3)) {
      var i2 = r2[o3];
      i2 && "object" == typeof i2 && n3 && "object" == typeof n3 ? r2[o3] = t2(i2, n3, e2) : r2.push(n3);
    } else
      r2[o3] = n3;
  }), r2) : Object.keys(n2).reduce(function(r3, o3) {
    var i2 = n2[o3];
    return r3[o3] = s.call(r3, o3) ? t2(r3[o3], i2, e2) : i2, r3;
  }, o2);
} }, b = Object.prototype.hasOwnProperty, h = { brackets: function(t4) {
  return t4 + "[]";
}, comma: "comma", indices: function(t4, r2) {
  return t4 + "[" + r2 + "]";
}, repeat: function(t4) {
  return t4;
} }, m = Array.isArray, g = String.prototype.split, j = Array.prototype.push, w = function(t4, r2) {
  j.apply(t4, m(r2) ? r2 : [r2]);
}, O = Date.prototype.toISOString, E = l.default, R = { addQueryPrefix: false, allowDots: false, charset: "utf-8", charsetSentinel: false, delimiter: "&", encode: true, encoder: d.encode, encodeValuesOnly: false, format: E, formatter: l.formatters[E], indices: false, serializeDate: function(t4) {
  return O.call(t4);
}, skipNulls: false, strictNullHandling: false }, S = function t3(r2, n2, e2, o2, i2, u2, f2, a2, c2, l2, s2, v2, p2, y2) {
  var b2, h2 = r2;
  if ("function" == typeof f2 ? h2 = f2(n2, h2) : h2 instanceof Date ? h2 = l2(h2) : "comma" === e2 && m(h2) && (h2 = d.maybeMap(h2, function(t4) {
    return t4 instanceof Date ? l2(t4) : t4;
  })), null === h2) {
    if (o2)
      return u2 && !p2 ? u2(n2, R.encoder, y2, "key", s2) : n2;
    h2 = "";
  }
  if ("string" == typeof (b2 = h2) || "number" == typeof b2 || "boolean" == typeof b2 || "symbol" == typeof b2 || "bigint" == typeof b2 || d.isBuffer(h2)) {
    if (u2) {
      var j2 = p2 ? n2 : u2(n2, R.encoder, y2, "key", s2);
      if ("comma" === e2 && p2) {
        for (var O2 = g.call(String(h2), ","), E2 = "", S2 = 0; S2 < O2.length; ++S2)
          E2 += (0 === S2 ? "" : ",") + v2(u2(O2[S2], R.encoder, y2, "value", s2));
        return [v2(j2) + "=" + E2];
      }
      return [v2(j2) + "=" + v2(u2(h2, R.encoder, y2, "value", s2))];
    }
    return [v2(n2) + "=" + v2(String(h2))];
  }
  var k2, x2 = [];
  if (void 0 === h2)
    return x2;
  if ("comma" === e2 && m(h2))
    k2 = [{ value: h2.length > 0 ? h2.join(",") || null : void 0 }];
  else if (m(f2))
    k2 = f2;
  else {
    var C2 = Object.keys(h2);
    k2 = a2 ? C2.sort(a2) : C2;
  }
  for (var T2 = 0; T2 < k2.length; ++T2) {
    var N2 = k2[T2], F2 = "object" == typeof N2 && void 0 !== N2.value ? N2.value : h2[N2];
    if (!i2 || null !== F2) {
      var D2 = m(h2) ? "function" == typeof e2 ? e2(n2, N2) : n2 : n2 + (c2 ? "." + N2 : "[" + N2 + "]");
      w(x2, t3(F2, D2, e2, o2, i2, u2, f2, a2, c2, l2, s2, v2, p2, y2));
    }
  }
  return x2;
}, k = Object.prototype.hasOwnProperty, x = Array.isArray, C = { allowDots: false, allowPrototypes: false, arrayLimit: 20, charset: "utf-8", charsetSentinel: false, comma: false, decoder: d.decode, delimiter: "&", depth: 5, ignoreQueryPrefix: false, interpretNumericEntities: false, parameterLimit: 1e3, parseArrays: true, plainObjects: false, strictNullHandling: false }, T = function(t4) {
  return t4.replace(/&#(\d+);/g, function(t5, r2) {
    return String.fromCharCode(parseInt(r2, 10));
  });
}, N = function(t4, r2) {
  return t4 && "string" == typeof t4 && r2.comma && t4.indexOf(",") > -1 ? t4.split(",") : t4;
}, F = function(t4, r2, n2, e2) {
  if (t4) {
    var o2 = n2.allowDots ? t4.replace(/\.([^.[]+)/g, "[$1]") : t4, i2 = /(\[[^[\]]*])/g, u2 = n2.depth > 0 && /(\[[^[\]]*])/.exec(o2), f2 = u2 ? o2.slice(0, u2.index) : o2, a2 = [];
    if (f2) {
      if (!n2.plainObjects && k.call(Object.prototype, f2) && !n2.allowPrototypes)
        return;
      a2.push(f2);
    }
    for (var c2 = 0; n2.depth > 0 && null !== (u2 = i2.exec(o2)) && c2 < n2.depth; ) {
      if (c2 += 1, !n2.plainObjects && k.call(Object.prototype, u2[1].slice(1, -1)) && !n2.allowPrototypes)
        return;
      a2.push(u2[1]);
    }
    return u2 && a2.push("[" + o2.slice(u2.index) + "]"), function(t5, r3, n3, e3) {
      for (var o3 = e3 ? r3 : N(r3, n3), i3 = t5.length - 1; i3 >= 0; --i3) {
        var u3, f3 = t5[i3];
        if ("[]" === f3 && n3.parseArrays)
          u3 = [].concat(o3);
        else {
          u3 = n3.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
          var a3 = "[" === f3.charAt(0) && "]" === f3.charAt(f3.length - 1) ? f3.slice(1, -1) : f3, c3 = parseInt(a3, 10);
          n3.parseArrays || "" !== a3 ? !isNaN(c3) && f3 !== a3 && String(c3) === a3 && c3 >= 0 && n3.parseArrays && c3 <= n3.arrayLimit ? (u3 = [])[c3] = o3 : "__proto__" !== a3 && (u3[a3] = o3) : u3 = { 0: o3 };
        }
        o3 = u3;
      }
      return o3;
    }(a2, r2, n2, e2);
  }
}, D = function(t4, r2) {
  var n2 = function(t5) {
    if (!t5)
      return C;
    if (null != t5.decoder && "function" != typeof t5.decoder)
      throw new TypeError("Decoder has to be a function.");
    if (void 0 !== t5.charset && "utf-8" !== t5.charset && "iso-8859-1" !== t5.charset)
      throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    return { allowDots: void 0 === t5.allowDots ? C.allowDots : !!t5.allowDots, allowPrototypes: "boolean" == typeof t5.allowPrototypes ? t5.allowPrototypes : C.allowPrototypes, arrayLimit: "number" == typeof t5.arrayLimit ? t5.arrayLimit : C.arrayLimit, charset: void 0 === t5.charset ? C.charset : t5.charset, charsetSentinel: "boolean" == typeof t5.charsetSentinel ? t5.charsetSentinel : C.charsetSentinel, comma: "boolean" == typeof t5.comma ? t5.comma : C.comma, decoder: "function" == typeof t5.decoder ? t5.decoder : C.decoder, delimiter: "string" == typeof t5.delimiter || d.isRegExp(t5.delimiter) ? t5.delimiter : C.delimiter, depth: "number" == typeof t5.depth || false === t5.depth ? +t5.depth : C.depth, ignoreQueryPrefix: true === t5.ignoreQueryPrefix, interpretNumericEntities: "boolean" == typeof t5.interpretNumericEntities ? t5.interpretNumericEntities : C.interpretNumericEntities, parameterLimit: "number" == typeof t5.parameterLimit ? t5.parameterLimit : C.parameterLimit, parseArrays: false !== t5.parseArrays, plainObjects: "boolean" == typeof t5.plainObjects ? t5.plainObjects : C.plainObjects, strictNullHandling: "boolean" == typeof t5.strictNullHandling ? t5.strictNullHandling : C.strictNullHandling };
  }(r2);
  if ("" === t4 || null == t4)
    return n2.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
  for (var e2 = "string" == typeof t4 ? function(t5, r3) {
    var n3, e3 = {}, o3 = (r3.ignoreQueryPrefix ? t5.replace(/^\?/, "") : t5).split(r3.delimiter, Infinity === r3.parameterLimit ? void 0 : r3.parameterLimit), i3 = -1, u3 = r3.charset;
    if (r3.charsetSentinel)
      for (n3 = 0; n3 < o3.length; ++n3)
        0 === o3[n3].indexOf("utf8=") && ("utf8=%E2%9C%93" === o3[n3] ? u3 = "utf-8" : "utf8=%26%2310003%3B" === o3[n3] && (u3 = "iso-8859-1"), i3 = n3, n3 = o3.length);
    for (n3 = 0; n3 < o3.length; ++n3)
      if (n3 !== i3) {
        var f3, a3, c2 = o3[n3], l2 = c2.indexOf("]="), s2 = -1 === l2 ? c2.indexOf("=") : l2 + 1;
        -1 === s2 ? (f3 = r3.decoder(c2, C.decoder, u3, "key"), a3 = r3.strictNullHandling ? null : "") : (f3 = r3.decoder(c2.slice(0, s2), C.decoder, u3, "key"), a3 = d.maybeMap(N(c2.slice(s2 + 1), r3), function(t6) {
          return r3.decoder(t6, C.decoder, u3, "value");
        })), a3 && r3.interpretNumericEntities && "iso-8859-1" === u3 && (a3 = T(a3)), c2.indexOf("[]=") > -1 && (a3 = x(a3) ? [a3] : a3), e3[f3] = k.call(e3, f3) ? d.combine(e3[f3], a3) : a3;
      }
    return e3;
  }(t4, n2) : t4, o2 = n2.plainObjects ? /* @__PURE__ */ Object.create(null) : {}, i2 = Object.keys(e2), u2 = 0; u2 < i2.length; ++u2) {
    var f2 = i2[u2], a2 = F(f2, e2[f2], n2, "string" == typeof t4);
    o2 = d.merge(o2, a2, n2);
  }
  return d.compact(o2);
}, P = /* @__PURE__ */ function() {
  function t4(t5, r2, n3) {
    var e2, o2;
    this.name = t5, this.definition = r2, this.bindings = null != (e2 = r2.bindings) ? e2 : {}, this.wheres = null != (o2 = r2.wheres) ? o2 : {}, this.config = n3;
  }
  var n2 = t4.prototype;
  return n2.matchesUrl = function(t5) {
    var r2 = this;
    if (!this.definition.methods.includes("GET"))
      return false;
    var n3 = this.template.replace(/(\/?){([^}?]*)(\??)}/g, function(t6, n4, e3, o3) {
      var i3, u3 = "(?<" + e3 + ">" + ((null == (i3 = r2.wheres[e3]) ? void 0 : i3.replace(/(^\^)|(\$$)/g, "")) || "[^/?]+") + ")";
      return o3 ? "(" + n4 + u3 + ")?" : "" + n4 + u3;
    }).replace(/^\w+:\/\//, ""), e2 = t5.replace(/^\w+:\/\//, "").split("?"), o2 = e2[0], i2 = e2[1], u2 = new RegExp("^" + n3 + "/?$").exec(o2);
    if (u2) {
      for (var f2 in u2.groups)
        u2.groups[f2] = "string" == typeof u2.groups[f2] ? decodeURIComponent(u2.groups[f2]) : u2.groups[f2];
      return { params: u2.groups, query: D(i2) };
    }
    return false;
  }, n2.compile = function(t5) {
    var r2 = this, n3 = this.parameterSegments;
    return n3.length ? this.template.replace(/{([^}?]+)(\??)}/g, function(e2, o2, i2) {
      var u2, f2, a2;
      if (!i2 && [null, void 0].includes(t5[o2]))
        throw new Error("Ziggy error: '" + o2 + "' parameter is required for route '" + r2.name + "'.");
      if (n3[n3.length - 1].name === o2 && ".*" === r2.wheres[o2])
        return encodeURIComponent(null != (a2 = t5[o2]) ? a2 : "").replace(/%2F/g, "/");
      if (r2.wheres[o2] && !new RegExp("^" + (i2 ? "(" + r2.wheres[o2] + ")?" : r2.wheres[o2]) + "$").test(null != (u2 = t5[o2]) ? u2 : ""))
        throw new Error("Ziggy error: '" + o2 + "' parameter does not match required format '" + r2.wheres[o2] + "' for route '" + r2.name + "'.");
      return encodeURIComponent(null != (f2 = t5[o2]) ? f2 : "");
    }).replace(this.origin + "//", this.origin + "/").replace(/\/+$/, "") : this.template;
  }, r(t4, [{ key: "template", get: function() {
    return (this.origin + "/" + this.definition.uri).replace(/\/+$/, "");
  } }, { key: "origin", get: function() {
    return this.config.absolute ? this.definition.domain ? "" + this.config.url.match(/^\w+:\/\//)[0] + this.definition.domain + (this.config.port ? ":" + this.config.port : "") : this.config.url : "";
  } }, { key: "parameterSegments", get: function() {
    var t5, r2;
    return null != (t5 = null == (r2 = this.template.match(/{[^}?]+\??}/g)) ? void 0 : r2.map(function(t6) {
      return { name: t6.replace(/{|\??}/g, ""), required: !/\?}$/.test(t6) };
    })) ? t5 : [];
  } }]), t4;
}(), $ = /* @__PURE__ */ function(t4) {
  var e2, i2;
  function u2(r2, e3, o2, i3) {
    var u3;
    if (void 0 === o2 && (o2 = true), (u3 = t4.call(this) || this).t = null != i3 ? i3 : "undefined" != typeof Ziggy ? Ziggy : null == globalThis ? void 0 : globalThis.Ziggy, u3.t = n({}, u3.t, { absolute: o2 }), r2) {
      if (!u3.t.routes[r2])
        throw new Error("Ziggy error: route '" + r2 + "' is not in the route list.");
      u3.i = new P(r2, u3.t.routes[r2], u3.t), u3.u = u3.l(e3);
    }
    return u3;
  }
  i2 = t4, (e2 = u2).prototype = Object.create(i2.prototype), e2.prototype.constructor = e2, o(e2, i2);
  var f2 = u2.prototype;
  return f2.toString = function() {
    var t5 = this, r2 = Object.keys(this.u).filter(function(r3) {
      return !t5.i.parameterSegments.some(function(t6) {
        return t6.name === r3;
      });
    }).filter(function(t6) {
      return "_query" !== t6;
    }).reduce(function(r3, e3) {
      var o2;
      return n({}, r3, ((o2 = {})[e3] = t5.u[e3], o2));
    }, {});
    return this.i.compile(this.u) + function(t6, r3) {
      var n2, e3 = t6, o2 = function(t7) {
        if (!t7)
          return R;
        if (null != t7.encoder && "function" != typeof t7.encoder)
          throw new TypeError("Encoder has to be a function.");
        var r4 = t7.charset || R.charset;
        if (void 0 !== t7.charset && "utf-8" !== t7.charset && "iso-8859-1" !== t7.charset)
          throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
        var n3 = l.default;
        if (void 0 !== t7.format) {
          if (!b.call(l.formatters, t7.format))
            throw new TypeError("Unknown format option provided.");
          n3 = t7.format;
        }
        var e4 = l.formatters[n3], o3 = R.filter;
        return ("function" == typeof t7.filter || m(t7.filter)) && (o3 = t7.filter), { addQueryPrefix: "boolean" == typeof t7.addQueryPrefix ? t7.addQueryPrefix : R.addQueryPrefix, allowDots: void 0 === t7.allowDots ? R.allowDots : !!t7.allowDots, charset: r4, charsetSentinel: "boolean" == typeof t7.charsetSentinel ? t7.charsetSentinel : R.charsetSentinel, delimiter: void 0 === t7.delimiter ? R.delimiter : t7.delimiter, encode: "boolean" == typeof t7.encode ? t7.encode : R.encode, encoder: "function" == typeof t7.encoder ? t7.encoder : R.encoder, encodeValuesOnly: "boolean" == typeof t7.encodeValuesOnly ? t7.encodeValuesOnly : R.encodeValuesOnly, filter: o3, format: n3, formatter: e4, serializeDate: "function" == typeof t7.serializeDate ? t7.serializeDate : R.serializeDate, skipNulls: "boolean" == typeof t7.skipNulls ? t7.skipNulls : R.skipNulls, sort: "function" == typeof t7.sort ? t7.sort : null, strictNullHandling: "boolean" == typeof t7.strictNullHandling ? t7.strictNullHandling : R.strictNullHandling };
      }(r3);
      "function" == typeof o2.filter ? e3 = (0, o2.filter)("", e3) : m(o2.filter) && (n2 = o2.filter);
      var i3 = [];
      if ("object" != typeof e3 || null === e3)
        return "";
      var u3 = h[r3 && r3.arrayFormat in h ? r3.arrayFormat : r3 && "indices" in r3 ? r3.indices ? "indices" : "repeat" : "indices"];
      n2 || (n2 = Object.keys(e3)), o2.sort && n2.sort(o2.sort);
      for (var f3 = 0; f3 < n2.length; ++f3) {
        var a2 = n2[f3];
        o2.skipNulls && null === e3[a2] || w(i3, S(e3[a2], a2, u3, o2.strictNullHandling, o2.skipNulls, o2.encode ? o2.encoder : null, o2.filter, o2.sort, o2.allowDots, o2.serializeDate, o2.format, o2.formatter, o2.encodeValuesOnly, o2.charset));
      }
      var c2 = i3.join(o2.delimiter), s2 = true === o2.addQueryPrefix ? "?" : "";
      return o2.charsetSentinel && (s2 += "iso-8859-1" === o2.charset ? "utf8=%26%2310003%3B&" : "utf8=%E2%9C%93&"), c2.length > 0 ? s2 + c2 : "";
    }(n({}, r2, this.u._query), { addQueryPrefix: true, arrayFormat: "indices", encodeValuesOnly: true, skipNulls: true, encoder: function(t6, r3) {
      return "boolean" == typeof t6 ? Number(t6) : r3(t6);
    } });
  }, f2.v = function(t5) {
    var r2 = this;
    t5 ? this.t.absolute && t5.startsWith("/") && (t5 = this.p().host + t5) : t5 = this.h();
    var e3 = {}, o2 = Object.entries(this.t.routes).find(function(n2) {
      return e3 = new P(n2[0], n2[1], r2.t).matchesUrl(t5);
    }) || [void 0, void 0];
    return n({ name: o2[0] }, e3, { route: o2[1] });
  }, f2.h = function() {
    var t5 = this.p(), r2 = t5.pathname, n2 = t5.search;
    return (this.t.absolute ? t5.host + r2 : r2.replace(this.t.url.replace(/^\w*:\/\/[^/]+/, ""), "").replace(/^\/+/, "/")) + n2;
  }, f2.current = function(t5, r2) {
    var e3 = this.v(), o2 = e3.name, i3 = e3.params, u3 = e3.query, f3 = e3.route;
    if (!t5)
      return o2;
    var a2 = new RegExp("^" + t5.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$").test(o2);
    if ([null, void 0].includes(r2) || !a2)
      return a2;
    var c2 = new P(o2, f3, this.t);
    r2 = this.l(r2, c2);
    var l2 = n({}, i3, u3);
    return !(!Object.values(r2).every(function(t6) {
      return !t6;
    }) || Object.values(l2).some(function(t6) {
      return void 0 !== t6;
    })) || Object.entries(r2).every(function(t6) {
      return l2[t6[0]] == t6[1];
    });
  }, f2.p = function() {
    var t5, r2, n2, e3, o2, i3, u3 = "undefined" != typeof window ? window.location : {}, f3 = u3.host, a2 = u3.pathname, c2 = u3.search;
    return { host: null != (t5 = null == (r2 = this.t.location) ? void 0 : r2.host) ? t5 : void 0 === f3 ? "" : f3, pathname: null != (n2 = null == (e3 = this.t.location) ? void 0 : e3.pathname) ? n2 : void 0 === a2 ? "" : a2, search: null != (o2 = null == (i3 = this.t.location) ? void 0 : i3.search) ? o2 : void 0 === c2 ? "" : c2 };
  }, f2.has = function(t5) {
    return Object.keys(this.t.routes).includes(t5);
  }, f2.l = function(t5, r2) {
    var e3 = this;
    void 0 === t5 && (t5 = {}), void 0 === r2 && (r2 = this.i), null != t5 || (t5 = {}), t5 = ["string", "number"].includes(typeof t5) ? [t5] : t5;
    var o2 = r2.parameterSegments.filter(function(t6) {
      return !e3.t.defaults[t6.name];
    });
    if (Array.isArray(t5))
      t5 = t5.reduce(function(t6, r3, e4) {
        var i4, u3;
        return n({}, t6, o2[e4] ? ((i4 = {})[o2[e4].name] = r3, i4) : "object" == typeof r3 ? r3 : ((u3 = {})[r3] = "", u3));
      }, {});
    else if (1 === o2.length && !t5[o2[0].name] && (t5.hasOwnProperty(Object.values(r2.bindings)[0]) || t5.hasOwnProperty("id"))) {
      var i3;
      (i3 = {})[o2[0].name] = t5, t5 = i3;
    }
    return n({}, this.m(r2), this.g(t5, r2));
  }, f2.m = function(t5) {
    var r2 = this;
    return t5.parameterSegments.filter(function(t6) {
      return r2.t.defaults[t6.name];
    }).reduce(function(t6, e3, o2) {
      var i3, u3 = e3.name;
      return n({}, t6, ((i3 = {})[u3] = r2.t.defaults[u3], i3));
    }, {});
  }, f2.g = function(t5, r2) {
    var e3 = r2.bindings, o2 = r2.parameterSegments;
    return Object.entries(t5).reduce(function(t6, r3) {
      var i3, u3, f3 = r3[0], a2 = r3[1];
      if (!a2 || "object" != typeof a2 || Array.isArray(a2) || !o2.some(function(t7) {
        return t7.name === f3;
      }))
        return n({}, t6, ((u3 = {})[f3] = a2, u3));
      if (!a2.hasOwnProperty(e3[f3])) {
        if (!a2.hasOwnProperty("id"))
          throw new Error("Ziggy error: object passed as '" + f3 + "' parameter is missing route model binding key '" + e3[f3] + "'.");
        e3[f3] = "id";
      }
      return n({}, t6, ((i3 = {})[f3] = a2[e3[f3]], i3));
    }, {});
  }, f2.valueOf = function() {
    return this.toString();
  }, f2.check = function(t5) {
    return this.has(t5);
  }, r(u2, [{ key: "params", get: function() {
    var t5 = this.v();
    return n({}, t5.params, t5.query);
  } }]), u2;
}(/* @__PURE__ */ f(String));
function A(t4, r2, n2, e2) {
  var o2 = new $(t4, r2, n2, e2);
  return t4 ? o2.toString() : o2;
}
const Ziggy$1 = { "url": "http://localhost", "port": null, "defaults": {}, "routes": { "sanctum.csrf-cookie": { "uri": "sanctum/csrf-cookie", "methods": ["GET", "HEAD"] }, "ignition.healthCheck": { "uri": "_ignition/health-check", "methods": ["GET", "HEAD"] }, "ignition.executeSolution": { "uri": "_ignition/execute-solution", "methods": ["POST"] }, "ignition.updateConfig": { "uri": "_ignition/update-config", "methods": ["POST"] }, "welcome": { "uri": "/", "methods": ["GET", "HEAD"] }, "home": { "uri": "home", "methods": ["GET", "HEAD"] } } };
if (typeof window !== "undefined" && typeof window.Ziggy !== "undefined") {
  Object.assign(Ziggy$1.routes, window.Ziggy.routes);
}
global.route = (name2, params, absolute, config) => A(name2, params, absolute, Ziggy$1);
createServer(
  (page) => createInertiaApp({
    page,
    resolve: (name2) => {
      const pages = /* @__PURE__ */ Object.assign({
        "./Pages/Home.svelte": __vite_glob_0_0,
        "./Pages/Welcome.svelte": __vite_glob_0_1
      });
      return pages[`./Pages/${name2}.svelte`];
    }
  })
);
