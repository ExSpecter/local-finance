
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.21.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* node_modules\svelte-icons\components\IconBase.svelte generated by Svelte v3.21.0 */

    const file = "node_modules\\svelte-icons\\components\\IconBase.svelte";

    // (18:2) {#if title}
    function create_if_block(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[0]);
    			add_location(title_1, file, 18, 4, 298);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(18:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let svg;
    	let if_block_anchor;
    	let current;
    	let if_block = /*title*/ ctx[0] && create_if_block(ctx);
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (default_slot) default_slot.c();
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			attr_dev(svg, "class", "svelte-c8tyih");
    			add_location(svg, file, 16, 0, 229);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, if_block_anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(svg, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
    				}
    			}

    			if (!current || dirty & /*viewBox*/ 2) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { title = null } = $$props;
    	let { viewBox } = $$props;
    	const writable_props = ["title", "viewBox"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IconBase> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("IconBase", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title, viewBox });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, viewBox, $$scope, $$slots];
    }

    class IconBase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { title: 0, viewBox: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconBase",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*viewBox*/ ctx[1] === undefined && !("viewBox" in props)) {
    			console.warn("<IconBase> was created without expected prop 'viewBox'");
    		}
    	}

    	get title() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewBox() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-icons\md\MdImportExport.svelte generated by Svelte v3.21.0 */
    const file$1 = "node_modules\\svelte-icons\\md\\MdImportExport.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z");
    			add_location(path, file$1, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	const iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MdImportExport", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdImportExport extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdImportExport",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* node_modules\svelte-icons\md\MdRefresh.svelte generated by Svelte v3.21.0 */
    const file$2 = "node_modules\\svelte-icons\\md\\MdRefresh.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z");
    			add_location(path, file$2, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	const iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MdRefresh", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdRefresh extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdRefresh",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* node_modules\svelte-icons\md\MdKeyboardArrowRight.svelte generated by Svelte v3.21.0 */
    const file$3 = "node_modules\\svelte-icons\\md\\MdKeyboardArrowRight.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$2(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z");
    			add_location(path, file$3, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	const iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MdKeyboardArrowRight", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdKeyboardArrowRight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdKeyboardArrowRight",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* node_modules\svelte-icons\md\MdKeyboardArrowLeft.svelte generated by Svelte v3.21.0 */
    const file$4 = "node_modules\\svelte-icons\\md\\MdKeyboardArrowLeft.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$3(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z");
    			add_location(path, file$4, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	const iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MdKeyboardArrowLeft", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdKeyboardArrowLeft extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdKeyboardArrowLeft",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function expoIn(t) {
        return t === 0.0 ? t : Math.pow(2.0, 10.0 * (t - 1.0));
    }
    function expoOut(t) {
        return t === 1.0 ? t : 1.0 - Math.pow(2.0, -10.0 * t);
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => `overflow: hidden;` +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* node_modules\svelte-icons\md\MdKeyboardArrowUp.svelte generated by Svelte v3.21.0 */
    const file$5 = "node_modules\\svelte-icons\\md\\MdKeyboardArrowUp.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$4(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z");
    			add_location(path, file$5, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	const iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MdKeyboardArrowUp", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdKeyboardArrowUp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdKeyboardArrowUp",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* node_modules\svelte-icons\md\MdKeyboardArrowDown.svelte generated by Svelte v3.21.0 */
    const file$6 = "node_modules\\svelte-icons\\md\\MdKeyboardArrowDown.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$5(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z");
    			add_location(path, file$6, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$5] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	const iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MdKeyboardArrowDown", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdKeyboardArrowDown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdKeyboardArrowDown",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* node_modules\svelte-icons\md\MdClose.svelte generated by Svelte v3.21.0 */
    const file$7 = "node_modules\\svelte-icons\\md\\MdClose.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$6(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
    			add_location(path, file$7, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$6] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	const iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MdClose", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdClose extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdClose",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\views\main\components\CashFlowList.svelte generated by Svelte v3.21.0 */

    const { Object: Object_1 } = globals;
    const file$8 = "src\\views\\main\\components\\CashFlowList.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[33] = list[i];
    	child_ctx[32] = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	child_ctx[32] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	return child_ctx;
    }

    // (123:0) {#if filteredList.length > 0 && withSorting}
    function create_if_block_8(ctx) {
    	let div;
    	let current;
    	let each_value_2 = /*columns*/ ctx[11];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "filter-buttons svelte-gjb39r");
    			add_location(div, file$8, 123, 4, 3862);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*columns, sorting, setSorting, reverse*/ 6240) {
    				each_value_2 = /*columns*/ ctx[11];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(123:0) {#if filteredList.length > 0 && withSorting}",
    		ctx
    	});

    	return block;
    }

    // (129:16) {:else}
    function create_else_block_1(ctx) {
    	let current;
    	const mdkeyboardarrowdown = new MdKeyboardArrowDown({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mdkeyboardarrowdown.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mdkeyboardarrowdown, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdkeyboardarrowdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdkeyboardarrowdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mdkeyboardarrowdown, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(129:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (127:16) {#if reverse}
    function create_if_block_9(ctx) {
    	let current;
    	const mdkeyboardarrowup = new MdKeyboardArrowUp({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mdkeyboardarrowup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mdkeyboardarrowup, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdkeyboardarrowup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdkeyboardarrowup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mdkeyboardarrowup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(127:16) {#if reverse}",
    		ctx
    	});

    	return block;
    }

    // (125:8) {#each columns as column}
    function create_each_block_2(ctx) {
    	let span;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let span_class_value;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block_9, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*reverse*/ ctx[6]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[26](/*column*/ ctx[35], ...args);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if_block.c();
    			t = space();
    			attr_dev(span, "class", span_class_value = "icon " + /*column*/ ctx[35].css + " svelte-gjb39r");
    			toggle_class(span, "active", /*sorting*/ ctx[5] === /*column*/ ctx[35].name);
    			add_location(span, file$8, 125, 12, 3939);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, span, anchor);
    			if_blocks[current_block_type_index].m(span, null);
    			append_dev(span, t);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(span, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(span, t);
    			}

    			if (dirty[0] & /*sorting, columns*/ 2080) {
    				toggle_class(span, "active", /*sorting*/ ctx[5] === /*column*/ ctx[35].name);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if_blocks[current_block_type_index].d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(125:8) {#each columns as column}",
    		ctx
    	});

    	return block;
    }

    // (150:20) {#if !sublist}
    function create_if_block_7(ctx) {
    	let p;
    	let t_value = /*cashflow*/ ctx[30].beneficiary + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-gjb39r");
    			add_location(p, file$8, 150, 24, 5054);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredList*/ 256 && t_value !== (t_value = /*cashflow*/ ctx[30].beneficiary + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(150:20) {#if !sublist}",
    		ctx
    	});

    	return block;
    }

    // (153:20) {#if cashflow.mergedItems.length === 0 || !isPeriodical }
    function create_if_block_5(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*cashflow*/ ctx[30].usageText + "";
    	let t0;
    	let t1;
    	let if_block = !/*sublist*/ ctx[3] && create_if_block_6(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "usageText svelte-gjb39r");
    			add_location(div0, file$8, 154, 28, 5274);
    			attr_dev(div1, "class", "tooltip-wrapper svelte-gjb39r");
    			add_location(div1, file$8, 153, 24, 5215);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredList*/ 256 && t0_value !== (t0_value = /*cashflow*/ ctx[30].usageText + "")) set_data_dev(t0, t0_value);

    			if (!/*sublist*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_6(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(153:20) {#if cashflow.mergedItems.length === 0 || !isPeriodical }",
    		ctx
    	});

    	return block;
    }

    // (160:28) {#if !sublist}
    function create_if_block_6(ctx) {
    	let div;
    	let t_value = /*cashflow*/ ctx[30].usageText + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "tooltip svelte-gjb39r");
    			toggle_class(div, "last", /*i*/ ctx[32] + 1 === /*filteredList*/ ctx[8].length);
    			add_location(div, file$8, 160, 32, 5469);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredList*/ 256 && t_value !== (t_value = /*cashflow*/ ctx[30].usageText + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*filteredList*/ 256) {
    				toggle_class(div, "last", /*i*/ ctx[32] + 1 === /*filteredList*/ ctx[8].length);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(160:28) {#if !sublist}",
    		ctx
    	});

    	return block;
    }

    // (173:20) {#if isPeriodical && cashflow.mergedItems.length > 0}
    function create_if_block_3(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block_4, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*displayMergedItems*/ ctx[7].visible && /*displayMergedItems*/ ctx[7].index === /*i*/ ctx[32]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[27](/*cashflow*/ ctx[30], /*i*/ ctx[32], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "merged-item-count svelte-gjb39r");
    			add_location(div, file$8, 173, 24, 6079);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div, "click", stop_propagation(click_handler_1), false, false, true);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(173:20) {#if isPeriodical && cashflow.mergedItems.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (177:28) {:else}
    function create_else_block(ctx) {
    	let t0;
    	let t1_value = /*cashflow*/ ctx[30].mergedItems.length + 1 + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("+ ");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredList*/ 256 && t1_value !== (t1_value = /*cashflow*/ ctx[30].mergedItems.length + 1 + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(177:28) {:else}",
    		ctx
    	});

    	return block;
    }

    // (175:28) {#if displayMergedItems.visible && displayMergedItems.index === i}
    function create_if_block_4(ctx) {
    	let div;
    	let current;
    	const mdclose = new MdClose({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(mdclose.$$.fragment);
    			attr_dev(div, "class", "close-botton svelte-gjb39r");
    			add_location(div, file$8, 175, 32, 6300);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(mdclose, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdclose.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdclose.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(mdclose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(175:28) {#if displayMergedItems.visible && displayMergedItems.index === i}",
    		ctx
    	});

    	return block;
    }

    // (185:12) {#if showSubmenu === i}
    function create_if_block_2(ctx) {
    	let li;
    	let li_transition;
    	let current;
    	let each_value_1 = /*submenuItems*/ ctx[10];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			li = element("li");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(li, "class", "submenu svelte-gjb39r");
    			add_location(li, file$8, 185, 16, 6645);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(li, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*callSubmenu, submenuItems, filteredList*/ 34048) {
    				each_value_1 = /*submenuItems*/ ctx[10];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(li, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!li_transition) li_transition = create_bidirectional_transition(li, slide, {}, true);
    				li_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!li_transition) li_transition = create_bidirectional_transition(li, slide, {}, false);
    			li_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_each(each_blocks, detaching);
    			if (detaching && li_transition) li_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(185:12) {#if showSubmenu === i}",
    		ctx
    	});

    	return block;
    }

    // (187:20) {#each submenuItems as submenuItem, i}
    function create_each_block_1(ctx) {
    	let div;
    	let t0_value = /*submenuItem*/ ctx[33] + "";
    	let t0;
    	let t1;
    	let dispose;

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[29](/*submenuItem*/ ctx[33], /*cashflow*/ ctx[30], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "item svelte-gjb39r");
    			add_location(div, file$8, 187, 24, 6768);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			if (remount) dispose();
    			dispose = listen_dev(div, "click", stop_propagation(click_handler_3), false, false, true);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*submenuItems*/ 1024 && t0_value !== (t0_value = /*submenuItem*/ ctx[33] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(187:20) {#each submenuItems as submenuItem, i}",
    		ctx
    	});

    	return block;
    }

    // (195:12) {#if isPeriodical && displayMergedItems.index === i && displayMergedItems.visible}
    function create_if_block_1(ctx) {
    	let li;
    	let t;
    	let li_transition;
    	let current;

    	const cashflowlist = new CashFlowList({
    			props: {
    				cashFlowList: /*displayMergedItems*/ ctx[7].items,
    				withSorting: false,
    				showTotalAmount: false,
    				sublist: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(cashflowlist.$$.fragment);
    			t = space();
    			attr_dev(li, "class", "merged-items svelte-gjb39r");
    			add_location(li, file$8, 195, 16, 7118);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(cashflowlist, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cashflowlist_changes = {};
    			if (dirty[0] & /*displayMergedItems*/ 128) cashflowlist_changes.cashFlowList = /*displayMergedItems*/ ctx[7].items;
    			cashflowlist.$set(cashflowlist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cashflowlist.$$.fragment, local);

    			add_render_callback(() => {
    				if (!li_transition) li_transition = create_bidirectional_transition(li, slide, {}, true);
    				li_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cashflowlist.$$.fragment, local);
    			if (!li_transition) li_transition = create_bidirectional_transition(li, slide, {}, false);
    			li_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(cashflowlist);
    			if (detaching && li_transition) li_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(195:12) {#if isPeriodical && displayMergedItems.index === i && displayMergedItems.visible}",
    		ctx
    	});

    	return block;
    }

    // (139:8) {#each filteredList as cashflow, i}
    function create_each_block(ctx) {
    	let li;
    	let span0;
    	let t0_value = getDateString(/*cashflow*/ ctx[30].bookingDay) + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2;
    	let t3;
    	let div;
    	let span2;
    	let t4_value = /*getCashflowAmount*/ ctx[16](/*cashflow*/ ctx[30]) + "";
    	let t4;
    	let t5;
    	let t6;
    	let div_class_value;
    	let li_transition;
    	let t7;
    	let t8;
    	let if_block4_anchor;
    	let current;
    	let dispose;
    	let if_block0 = !/*sublist*/ ctx[3] && create_if_block_7(ctx);
    	let if_block1 = (/*cashflow*/ ctx[30].mergedItems.length === 0 || !/*isPeriodical*/ ctx[2]) && create_if_block_5(ctx);
    	let if_block2 = /*isPeriodical*/ ctx[2] && /*cashflow*/ ctx[30].mergedItems.length > 0 && create_if_block_3(ctx);

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[28](/*i*/ ctx[32], ...args);
    	}

    	let if_block3 = /*showSubmenu*/ ctx[4] === /*i*/ ctx[32] && create_if_block_2(ctx);
    	let if_block4 = /*isPeriodical*/ ctx[2] && /*displayMergedItems*/ ctx[7].index === /*i*/ ctx[32] && /*displayMergedItems*/ ctx[7].visible && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			div = element("div");
    			span2 = element("span");
    			t4 = text(t4_value);
    			t5 = text(" €");
    			t6 = space();
    			if (if_block2) if_block2.c();
    			t7 = space();
    			if (if_block3) if_block3.c();
    			t8 = space();
    			if (if_block4) if_block4.c();
    			if_block4_anchor = empty();
    			attr_dev(span0, "class", "date svelte-gjb39r");
    			add_location(span0, file$8, 145, 16, 4853);
    			attr_dev(span1, "class", "text svelte-gjb39r");
    			add_location(span1, file$8, 148, 16, 4973);
    			attr_dev(span2, "class", "amount svelte-gjb39r");
    			add_location(span2, file$8, 168, 20, 5867);
    			attr_dev(div, "class", div_class_value = "amount-wrapper " + (/*cashflow*/ ctx[30].isIncome() ? "income" : "spending") + " svelte-gjb39r");
    			add_location(div, file$8, 167, 16, 5770);
    			attr_dev(li, "class", "flow-item svelte-gjb39r");
    			toggle_class(li, "with-periodical", /*cashflow*/ ctx[30].hasPeriodical());
    			toggle_class(li, "amount-unequal", /*cashflow*/ ctx[30].hasPeriodical() && !/*cashflowAmountEqualToPeriodical*/ ctx[17](/*cashflow*/ ctx[30]));
    			add_location(li, file$8, 139, 12, 4451);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span0);
    			append_dev(span0, t0);
    			append_dev(li, t1);
    			append_dev(li, span1);
    			if (if_block0) if_block0.m(span1, null);
    			append_dev(span1, t2);
    			if (if_block1) if_block1.m(span1, null);
    			append_dev(li, t3);
    			append_dev(li, div);
    			append_dev(div, span2);
    			append_dev(span2, t4);
    			append_dev(span2, t5);
    			append_dev(div, t6);
    			if (if_block2) if_block2.m(div, null);
    			insert_dev(target, t7, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, if_block4_anchor, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(li, "click", click_handler_2, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*filteredList*/ 256) && t0_value !== (t0_value = getDateString(/*cashflow*/ ctx[30].bookingDay) + "")) set_data_dev(t0, t0_value);

    			if (!/*sublist*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					if_block0.m(span1, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cashflow*/ ctx[30].mergedItems.length === 0 || !/*isPeriodical*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					if_block1.m(span1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if ((!current || dirty[0] & /*filteredList*/ 256) && t4_value !== (t4_value = /*getCashflowAmount*/ ctx[16](/*cashflow*/ ctx[30]) + "")) set_data_dev(t4, t4_value);

    			if (/*isPeriodical*/ ctx[2] && /*cashflow*/ ctx[30].mergedItems.length > 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*isPeriodical, filteredList*/ 260) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_3(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*filteredList*/ 256 && div_class_value !== (div_class_value = "amount-wrapper " + (/*cashflow*/ ctx[30].isIncome() ? "income" : "spending") + " svelte-gjb39r")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty[0] & /*filteredList*/ 256) {
    				toggle_class(li, "with-periodical", /*cashflow*/ ctx[30].hasPeriodical());
    			}

    			if (dirty[0] & /*filteredList, cashflowAmountEqualToPeriodical*/ 131328) {
    				toggle_class(li, "amount-unequal", /*cashflow*/ ctx[30].hasPeriodical() && !/*cashflowAmountEqualToPeriodical*/ ctx[17](/*cashflow*/ ctx[30]));
    			}

    			if (/*showSubmenu*/ ctx[4] === /*i*/ ctx[32]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*showSubmenu*/ 16) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_2(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t8.parentNode, t8);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*isPeriodical*/ ctx[2] && /*displayMergedItems*/ ctx[7].index === /*i*/ ctx[32] && /*displayMergedItems*/ ctx[7].visible) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*isPeriodical, displayMergedItems*/ 132) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_1(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(if_block4_anchor.parentNode, if_block4_anchor);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);

    			add_render_callback(() => {
    				if (!li_transition) li_transition = create_bidirectional_transition(
    					li,
    					fly,
    					/*sublist*/ ctx[3]
    					? { duration: 0, delay: 0 }
    					: {
    							x: -100,
    							duration: 150,
    							delay: /*i*/ ctx[32] * 40
    						},
    					true
    				);

    				li_transition.run(1);
    			});

    			transition_in(if_block3);
    			transition_in(if_block4);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);

    			if (!li_transition) li_transition = create_bidirectional_transition(
    				li,
    				fly,
    				/*sublist*/ ctx[3]
    				? { duration: 0, delay: 0 }
    				: {
    						x: -100,
    						duration: 150,
    						delay: /*i*/ ctx[32] * 40
    					},
    				false
    			);

    			li_transition.run(0);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (detaching && li_transition) li_transition.end();
    			if (detaching) detach_dev(t7);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(if_block4_anchor);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(139:8) {#each filteredList as cashflow, i}",
    		ctx
    	});

    	return block;
    }

    // (205:0) {#if showTotalAmount}
    function create_if_block$1(ctx) {
    	let div;
    	let t0_value = /*totalAmount*/ ctx[9].toFixed(2) + "";
    	let t0;
    	let t1;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(" €");
    			attr_dev(div, "class", div_class_value = "total-amount " + (/*totalAmount*/ ctx[9] >= 0 ? "income" : "spending") + " svelte-gjb39r");
    			add_location(div, file$8, 205, 4, 7407);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*totalAmount*/ 512 && t0_value !== (t0_value = /*totalAmount*/ ctx[9].toFixed(2) + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*totalAmount*/ 512 && div_class_value !== (div_class_value = "total-amount " + (/*totalAmount*/ ctx[9] >= 0 ? "income" : "spending") + " svelte-gjb39r")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(205:0) {#if showTotalAmount}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let t0;
    	let div;
    	let ul;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*filteredList*/ ctx[8].length > 0 && /*withSorting*/ ctx[0] && create_if_block_8(ctx);
    	let each_value = /*filteredList*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block1 = /*showTotalAmount*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(ul, "class", "svelte-gjb39r");
    			add_location(ul, file$8, 137, 4, 4388);
    			attr_dev(div, "class", "flow-list svelte-gjb39r");
    			set_style(div, "overflow", /*sublist*/ ctx[3] ? "hidden" : "auto");
    			toggle_class(div, "sublist", /*sublist*/ ctx[3]);
    			add_location(div, file$8, 136, 0, 4285);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*filteredList*/ ctx[8].length > 0 && /*withSorting*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*filteredList, withSorting*/ 257) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*displayMergedItems, isPeriodical, submenuItems, callSubmenu, filteredList, showSubmenu, cashflowAmountEqualToPeriodical, toggleSubmenu, toggleSublist, getCashflowAmount, sublist*/ 255388) {
    				each_value = /*filteredList*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*sublist*/ 8) {
    				set_style(div, "overflow", /*sublist*/ ctx[3] ? "hidden" : "auto");
    			}

    			if (dirty[0] & /*sublist*/ 8) {
    				toggle_class(div, "sublist", /*sublist*/ ctx[3]);
    			}

    			if (/*showTotalAmount*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getDateString(date) {
    	return `${doubleDigitString(date.getDate())}.${doubleDigitString(date.getMonth() + 1)}.${date.getFullYear()}`;
    }

    function doubleDigitString(number) {
    	return ("0" + number).slice(-2);
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { title = "Cash Flow List" } = $$props;
    	let { cashFlowList = [] } = $$props;
    	let { searchValue = "" } = $$props;
    	let { withSorting = true } = $$props;
    	let { showTotalAmount = true } = $$props;
    	let { isPeriodical = false } = $$props;
    	let { sublist = false } = $$props;
    	let { submenu = {} } = $$props;
    	let showSubmenu = null;
    	let sorting = "bookingDay";
    	let reverse = false;

    	const columns = [
    		{ name: "bookingDay", css: "date" },
    		{ name: "beneficiary", css: "text" },
    		{ name: "amount", css: "amount" }
    	];

    	let displayMergedItems = { index: 0, items: [], visible: false };

    	function sortByName(a, b) {
    		return ("" + (reverse ? b : a)[sorting]).localeCompare((reverse ? a : b)[sorting]);
    	}

    	function sortByAmount(a, b) {
    		return (reverse ? b : a).getTotalAmount() - (reverse ? a : b).getTotalAmount();
    	}

    	function setSorting(name) {
    		$$invalidate(6, reverse = name === sorting ? !reverse : false);
    		$$invalidate(5, sorting = name);
    	}

    	function toggleSublist(cashflow, index) {
    		if (displayMergedItems.items.length > 0 && index === displayMergedItems.index) {
    			closeSublist();
    		} else {
    			$$invalidate(4, showSubmenu = null);
    			$$invalidate(7, displayMergedItems.index = index, displayMergedItems);

    			setTimeout(
    				() => {
    					$$invalidate(7, displayMergedItems.items = [cashflow, ...cashflow.mergedItems], displayMergedItems);
    					$$invalidate(7, displayMergedItems.visible = true, displayMergedItems);
    				},
    				0
    			);
    		}
    	}

    	function closeSublist(fast = false) {
    		if (fast) $$invalidate(7, displayMergedItems.index = -1, displayMergedItems);
    		$$invalidate(7, displayMergedItems.visible = false, displayMergedItems);
    		setTimeout(() => $$invalidate(7, displayMergedItems.items = [], displayMergedItems), 280);
    	}

    	function toggleSubmenu(index) {
    		closeSublist();
    		if (showSubmenu === index) closeSubmenu(); else $$invalidate(4, showSubmenu = index);
    	}

    	function closeSubmenu() {
    		$$invalidate(4, showSubmenu = null);
    	}

    	function callSubmenu(item, parameter) {
    		submenu[item](parameter);
    	}

    	function getCashflowAmount(cashflow) {
    		return isPeriodical
    		? (cashflow.getTotalAmount() || cashflow.getAmount()).toFixed(2)
    		: cashflow.getAmount().toFixed(2);
    	}

    	function cashflowAmountEqualToPeriodical(cashflow) {
    		if (!cashflow.periodical) return false;
    		return getCashflowAmount(cashflow) === cashflow.periodical.amount.toFixed(2);
    	}

    	const writable_props = [
    		"title",
    		"cashFlowList",
    		"searchValue",
    		"withSorting",
    		"showTotalAmount",
    		"isPeriodical",
    		"sublist",
    		"submenu"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CashFlowList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CashFlowList", $$slots, []);
    	const click_handler = column => setSorting(column.name);
    	const click_handler_1 = (cashflow, i) => toggleSublist(cashflow, i);
    	const click_handler_2 = i => toggleSubmenu(i);
    	const click_handler_3 = (submenuItem, cashflow) => callSubmenu(submenuItem, cashflow);

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(18, title = $$props.title);
    		if ("cashFlowList" in $$props) $$invalidate(19, cashFlowList = $$props.cashFlowList);
    		if ("searchValue" in $$props) $$invalidate(20, searchValue = $$props.searchValue);
    		if ("withSorting" in $$props) $$invalidate(0, withSorting = $$props.withSorting);
    		if ("showTotalAmount" in $$props) $$invalidate(1, showTotalAmount = $$props.showTotalAmount);
    		if ("isPeriodical" in $$props) $$invalidate(2, isPeriodical = $$props.isPeriodical);
    		if ("sublist" in $$props) $$invalidate(3, sublist = $$props.sublist);
    		if ("submenu" in $$props) $$invalidate(21, submenu = $$props.submenu);
    	};

    	$$self.$capture_state = () => ({
    		MdKeyboardArrowUp,
    		MdKeyboardArrowDown,
    		MdClose,
    		fly,
    		slide,
    		title,
    		cashFlowList,
    		searchValue,
    		withSorting,
    		showTotalAmount,
    		isPeriodical,
    		sublist,
    		submenu,
    		showSubmenu,
    		sorting,
    		reverse,
    		columns,
    		displayMergedItems,
    		sortByName,
    		sortByAmount,
    		setSorting,
    		getDateString,
    		doubleDigitString,
    		toggleSublist,
    		closeSublist,
    		toggleSubmenu,
    		closeSubmenu,
    		callSubmenu,
    		getCashflowAmount,
    		cashflowAmountEqualToPeriodical,
    		filteredList,
    		totalAmount,
    		submenuItems
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(18, title = $$props.title);
    		if ("cashFlowList" in $$props) $$invalidate(19, cashFlowList = $$props.cashFlowList);
    		if ("searchValue" in $$props) $$invalidate(20, searchValue = $$props.searchValue);
    		if ("withSorting" in $$props) $$invalidate(0, withSorting = $$props.withSorting);
    		if ("showTotalAmount" in $$props) $$invalidate(1, showTotalAmount = $$props.showTotalAmount);
    		if ("isPeriodical" in $$props) $$invalidate(2, isPeriodical = $$props.isPeriodical);
    		if ("sublist" in $$props) $$invalidate(3, sublist = $$props.sublist);
    		if ("submenu" in $$props) $$invalidate(21, submenu = $$props.submenu);
    		if ("showSubmenu" in $$props) $$invalidate(4, showSubmenu = $$props.showSubmenu);
    		if ("sorting" in $$props) $$invalidate(5, sorting = $$props.sorting);
    		if ("reverse" in $$props) $$invalidate(6, reverse = $$props.reverse);
    		if ("displayMergedItems" in $$props) $$invalidate(7, displayMergedItems = $$props.displayMergedItems);
    		if ("filteredList" in $$props) $$invalidate(8, filteredList = $$props.filteredList);
    		if ("totalAmount" in $$props) $$invalidate(9, totalAmount = $$props.totalAmount);
    		if ("submenuItems" in $$props) $$invalidate(10, submenuItems = $$props.submenuItems);
    	};

    	let filteredList;
    	let totalAmount;
    	let submenuItems;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*cashFlowList, searchValue, sorting, reverse*/ 1572960) {
    			 $$invalidate(8, filteredList = cashFlowList.filter(({ usageText, beneficiary }) => usageText.toLowerCase().includes(searchValue.toLowerCase()) || beneficiary.toLowerCase().includes(searchValue.toLowerCase())).sort((a, b) => {
    				if (typeof a[sorting] === "string") return sortByName(a, b);
    				if (sorting === "amount") return sortByAmount(a, b);
    				return (reverse ? b : a)[sorting] - (reverse ? a : b)[sorting];
    			}));
    		}

    		if ($$self.$$.dirty[0] & /*filteredList*/ 256) {
    			 if (filteredList) {
    				closeSublist();
    				closeSubmenu();
    			}
    		}

    		if ($$self.$$.dirty[0] & /*filteredList*/ 256) {
    			 $$invalidate(9, totalAmount = filteredList.reduce((acc, item) => acc + item.getTotalAmount(), 0));
    		}

    		if ($$self.$$.dirty[0] & /*submenu*/ 2097152) {
    			 $$invalidate(10, submenuItems = Object.keys(submenu));
    		}
    	};

    	return [
    		withSorting,
    		showTotalAmount,
    		isPeriodical,
    		sublist,
    		showSubmenu,
    		sorting,
    		reverse,
    		displayMergedItems,
    		filteredList,
    		totalAmount,
    		submenuItems,
    		columns,
    		setSorting,
    		toggleSublist,
    		toggleSubmenu,
    		callSubmenu,
    		getCashflowAmount,
    		cashflowAmountEqualToPeriodical,
    		title,
    		cashFlowList,
    		searchValue,
    		submenu,
    		sortByName,
    		sortByAmount,
    		closeSublist,
    		closeSubmenu,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class CashFlowList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$8,
    			create_fragment$8,
    			safe_not_equal,
    			{
    				title: 18,
    				cashFlowList: 19,
    				searchValue: 20,
    				withSorting: 0,
    				showTotalAmount: 1,
    				isPeriodical: 2,
    				sublist: 3,
    				submenu: 21
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CashFlowList",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get title() {
    		throw new Error("<CashFlowList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<CashFlowList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cashFlowList() {
    		throw new Error("<CashFlowList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cashFlowList(value) {
    		throw new Error("<CashFlowList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchValue() {
    		throw new Error("<CashFlowList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchValue(value) {
    		throw new Error("<CashFlowList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withSorting() {
    		throw new Error("<CashFlowList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withSorting(value) {
    		throw new Error("<CashFlowList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showTotalAmount() {
    		throw new Error("<CashFlowList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showTotalAmount(value) {
    		throw new Error("<CashFlowList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isPeriodical() {
    		throw new Error("<CashFlowList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isPeriodical(value) {
    		throw new Error("<CashFlowList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sublist() {
    		throw new Error("<CashFlowList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sublist(value) {
    		throw new Error("<CashFlowList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get submenu() {
    		throw new Error("<CashFlowList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set submenu(value) {
    		throw new Error("<CashFlowList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\views\main\components\SideBySideList.svelte generated by Svelte v3.21.0 */
    const file$9 = "src\\views\\main\\components\\SideBySideList.svelte";

    function create_fragment$9(ctx) {
    	let input;
    	let t0;
    	let div0;
    	let in_1;
    	let t1;
    	let out;
    	let t2;
    	let div1;
    	let t3_value = /*balance*/ ctx[5].toFixed(2) + "";
    	let t3;
    	let t4;
    	let div1_class_value;
    	let current;
    	let dispose;

    	const cashflowlist0 = new CashFlowList({
    			props: {
    				title: "Income",
    				cashFlowList: /*incomeFlow*/ ctx[0],
    				searchValue: /*searchValue*/ ctx[4],
    				isPeriodical: /*isPeriodical*/ ctx[2],
    				submenu: /*submenu*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const cashflowlist1 = new CashFlowList({
    			props: {
    				title: "Spending",
    				cashFlowList: /*spendingFlow*/ ctx[1],
    				searchValue: /*searchValue*/ ctx[4],
    				isPeriodical: /*isPeriodical*/ ctx[2],
    				submenu: /*submenu*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			div0 = element("div");
    			in_1 = element("in");
    			create_component(cashflowlist0.$$.fragment);
    			t1 = space();
    			out = element("out");
    			create_component(cashflowlist1.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = text(" €");
    			attr_dev(input, "placeholder", "Search for cashflow");
    			attr_dev(input, "class", "svelte-zloa07");
    			add_location(input, file$9, 14, 0, 373);
    			attr_dev(in_1, "class", "svelte-zloa07");
    			add_location(in_1, file$9, 17, 4, 470);
    			attr_dev(out, "class", "svelte-zloa07");
    			add_location(out, file$9, 18, 4, 606);
    			attr_dev(div0, "class", "lists svelte-zloa07");
    			add_location(div0, file$9, 16, 0, 445);
    			attr_dev(div1, "class", div1_class_value = "balance  " + (/*balance*/ ctx[5] < 0 ? "negative" : "positive") + " svelte-zloa07");
    			add_location(div1, file$9, 21, 0, 754);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*searchValue*/ ctx[4]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, in_1);
    			mount_component(cashflowlist0, in_1, null);
    			append_dev(div0, t1);
    			append_dev(div0, out);
    			mount_component(cashflowlist1, out, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[6]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*searchValue*/ 16 && input.value !== /*searchValue*/ ctx[4]) {
    				set_input_value(input, /*searchValue*/ ctx[4]);
    			}

    			const cashflowlist0_changes = {};
    			if (dirty & /*incomeFlow*/ 1) cashflowlist0_changes.cashFlowList = /*incomeFlow*/ ctx[0];
    			if (dirty & /*searchValue*/ 16) cashflowlist0_changes.searchValue = /*searchValue*/ ctx[4];
    			if (dirty & /*isPeriodical*/ 4) cashflowlist0_changes.isPeriodical = /*isPeriodical*/ ctx[2];
    			if (dirty & /*submenu*/ 8) cashflowlist0_changes.submenu = /*submenu*/ ctx[3];
    			cashflowlist0.$set(cashflowlist0_changes);
    			const cashflowlist1_changes = {};
    			if (dirty & /*spendingFlow*/ 2) cashflowlist1_changes.cashFlowList = /*spendingFlow*/ ctx[1];
    			if (dirty & /*searchValue*/ 16) cashflowlist1_changes.searchValue = /*searchValue*/ ctx[4];
    			if (dirty & /*isPeriodical*/ 4) cashflowlist1_changes.isPeriodical = /*isPeriodical*/ ctx[2];
    			if (dirty & /*submenu*/ 8) cashflowlist1_changes.submenu = /*submenu*/ ctx[3];
    			cashflowlist1.$set(cashflowlist1_changes);
    			if ((!current || dirty & /*balance*/ 32) && t3_value !== (t3_value = /*balance*/ ctx[5].toFixed(2) + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*balance*/ 32 && div1_class_value !== (div1_class_value = "balance  " + (/*balance*/ ctx[5] < 0 ? "negative" : "positive") + " svelte-zloa07")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cashflowlist0.$$.fragment, local);
    			transition_in(cashflowlist1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cashflowlist0.$$.fragment, local);
    			transition_out(cashflowlist1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			destroy_component(cashflowlist0);
    			destroy_component(cashflowlist1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { incomeFlow = [] } = $$props;
    	let { spendingFlow = [] } = $$props;
    	let { isPeriodical = false } = $$props;
    	let { submenu = {} } = $$props;
    	let searchValue = "";
    	const writable_props = ["incomeFlow", "spendingFlow", "isPeriodical", "submenu"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SideBySideList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SideBySideList", $$slots, []);

    	function input_input_handler() {
    		searchValue = this.value;
    		$$invalidate(4, searchValue);
    	}

    	$$self.$set = $$props => {
    		if ("incomeFlow" in $$props) $$invalidate(0, incomeFlow = $$props.incomeFlow);
    		if ("spendingFlow" in $$props) $$invalidate(1, spendingFlow = $$props.spendingFlow);
    		if ("isPeriodical" in $$props) $$invalidate(2, isPeriodical = $$props.isPeriodical);
    		if ("submenu" in $$props) $$invalidate(3, submenu = $$props.submenu);
    	};

    	$$self.$capture_state = () => ({
    		CashFlowList,
    		incomeFlow,
    		spendingFlow,
    		isPeriodical,
    		submenu,
    		searchValue,
    		balance
    	});

    	$$self.$inject_state = $$props => {
    		if ("incomeFlow" in $$props) $$invalidate(0, incomeFlow = $$props.incomeFlow);
    		if ("spendingFlow" in $$props) $$invalidate(1, spendingFlow = $$props.spendingFlow);
    		if ("isPeriodical" in $$props) $$invalidate(2, isPeriodical = $$props.isPeriodical);
    		if ("submenu" in $$props) $$invalidate(3, submenu = $$props.submenu);
    		if ("searchValue" in $$props) $$invalidate(4, searchValue = $$props.searchValue);
    		if ("balance" in $$props) $$invalidate(5, balance = $$props.balance);
    	};

    	let balance;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*incomeFlow, spendingFlow*/ 3) {
    			 $$invalidate(5, balance = [...incomeFlow, ...spendingFlow].reduce((balance, cashFlow) => balance + cashFlow.getTotalAmount(), 0));
    		}
    	};

    	return [
    		incomeFlow,
    		spendingFlow,
    		isPeriodical,
    		submenu,
    		searchValue,
    		balance,
    		input_input_handler
    	];
    }

    class SideBySideList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			incomeFlow: 0,
    			spendingFlow: 1,
    			isPeriodical: 2,
    			submenu: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideBySideList",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get incomeFlow() {
    		throw new Error("<SideBySideList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set incomeFlow(value) {
    		throw new Error("<SideBySideList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spendingFlow() {
    		throw new Error("<SideBySideList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spendingFlow(value) {
    		throw new Error("<SideBySideList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isPeriodical() {
    		throw new Error("<SideBySideList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isPeriodical(value) {
    		throw new Error("<SideBySideList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get submenu() {
    		throw new Error("<SideBySideList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set submenu(value) {
    		throw new Error("<SideBySideList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const accountExeptions = [
        "DE90700500000002055382", // Siemens Mannheim
        "DE41300606010001463829", // Lupus
    ];

    class Cashflow {
        constructor(csvEntry) {
            if(!csvEntry) return; 

            this.contractAccount = csvEntry['Auftragskonto'];
            this.bic = csvEntry['BIC (SWIFT-Code)'];
            this.amount = parseFloat(csvEntry['Betrag'].replace(',', '.'));
            this.currency = csvEntry['Waehrung'];
            this.bookingDay = new Date(convertDayString(csvEntry['Buchungstag']));
            this.bookingText = csvEntry['Buchungstext'];
            this.beneficiary = csvEntry['Beguenstigter/Zahlungspflichtiger'].replace(/\s+/g,' ');
            this.beneficiaryId = csvEntry['Glaeubiger ID'];
            this.beneficiaryAccount = csvEntry['Kontonummer/IBAN'];
            this.customerTestimonials = csvEntry['Kundenreferenz (End-to-End)'];
            this.usageText = csvEntry['Verwendungszweck'];

            this.mergedItems = [];

            this.periodical = null;
        }

        getAmount() {
            return this.amount;
        }

        getTotalAmount() {
            return this.mergedItems.reduce((acc, cashflow) => acc + cashflow.amount, 0) + this.amount;
        }

        setPeriodical(periodical) {
            this.periodical = periodical;
        }

        hasPeriodical() {
            return this.periodical != null
        }

        isIncome() {
            return this.amount >= 0;
        }

        isEqual(cashflow) {
            return this.bookingDay.getTime() === cashflow.bookingDay.getTime()
                && this.beneficiaryAccount === cashflow.beneficiaryAccount
                && this.amount === cashflow.amount
                && this.usageText === cashflow.usageText;
        }

        getSimilarity(cashflow, considerAmount) {
            if(cashflow.beneficiaryAccount === this.beneficiaryAccount
                && accountExeptions.includes(cashflow.beneficiaryAccount))
                return 1;

            const beneficiarySimilarity = this.beneficiaryAccount === cashflow.beneficiaryAccount;
            if(!beneficiarySimilarity) return 0;

            if(!considerAmount) return 1;

            return getAmountSimilarity(this.amount, cashflow.amount);
        }
    }

    function convertDayString(day) {
        let split = day.split('.');
        return `20${split[2]}-${split[1]}-${split[0]}`
    }

    function getAmountSimilarity(a, b) {
        const amountA = Math.abs(a);
        const amountB = Math.abs(b);
        return 1 - (Math.abs(amountA - amountB) / ((amountA + amountB) / 2));
    }

    class Periodical {
        constructor(periodical) {
            this.beneficiary = '';
            this.amount = 0;
            this.valueIsMonthly = true;
            this.comment = '';

            if(periodical) Object.assign(this, periodical);
        }

        static fromCashflow(cashflow) {
            const periodical = new Periodical();
            if(!cashflow) return periodical;
            periodical.beneficiary = cashflow.beneficiary;
            periodical.amount = cashflow.getTotalAmount() || cashflow.getAmount();
            periodical.comment = cashflow.usageText;
            return periodical;
        }

        getAmount() {
            return this.valueIsMonthly ? this.amount : this.amount / 12
        }

        getTotalAmount() {
            return this.getAmount();
        }

        setIsMonthly() {
            this.valueIsMonthly = true;
        }
        setIsYearly() {
            this.valueIsMonthly = false;
        }

        isIncome() {
            return this.amount >= 0;
        }
    }

    const monthBorder = 22;
    const similarThreshold = 0.75;

    function dateFilter(year, month) {
        return (item) => {
            const endDate = new Date(year, month - 1, monthBorder);
            const startDate = new Date(endDate);
            startDate.setMonth((getLastMonth(month) - 1));
            if (startDate.getMonth() === 11) startDate.setYear(year - 1);


            return item.bookingDay >= startDate && item.bookingDay < endDate;
        }
    }

    function getLastMonth(month) {
        return (month === 1) ? 12 : --month;
    }

    function subtractFromMonth(month, amount) {
        return (((month-amount)%12)+12)%12
    }

    class CashflowWithSimilars {
        constructor(item) {
            this.item = item;
            this.similarItems = [];
        }

        setSimilarItems(index, items) {
            this.similarItems[index] = items;
        }

        getAllSimilarItems() {
            return this.similarItems.reduce((acc, items) => ([...acc, ...items]), [])
        }
    }

    class CashflowAnalysis {
        constructor(cashflowList, depth, considerAmount = true) {
            this.cashflowList = [...cashflowList];
            this.depth = depth;
            this.considerAmount = considerAmount;

            this.cashflowsWithSimilarItems = [];
        }

        calculate(month) {
            const cashflows = getLastXMonth(this.depth, month, this.cashflowList);

            this.cashflowsWithSimilarItems = cashflows[0].map(cashflow => new CashflowWithSimilars(cashflow));
            for(let i = 1; i < cashflows.length; i++) {
                this.cashflowsWithSimilarItems.forEach(baseCashflow => {
                    const similarItems = getSimilarItems(baseCashflow.item, cashflows[i], this.considerAmount);
                    baseCashflow.setSimilarItems(i - 1, similarItems);
                });
            }
        }

        getPeriodical(month) {
            this.calculate(month);
            const periodicals = this.cashflowsWithSimilarItems.filter(item => {
                if(!item.similarItems.length && this.depth > 0) return false;
                return item.similarItems.reduce((acc, item) => acc && !!item, true);
            });

            const innerMergedPeriodicals = mergeDuplicates(periodicals);
            return innerMergedPeriodicals;
        }
    }

    function getLastXMonth(x, month, cashflowList) {
        let cashflows = [];
        for(let i = 0; i <= x; i++) {
            cashflows[i] = cashflowList.filter(dateFilter(2020, subtractFromMonth(month, i))); // TODO
        }
        return cashflows;
    }

    function getSimilarItems(cashflowItem, cashflowList, considerAmount) {
        const similarities = cashflowList.map(item => item.getSimilarity(cashflowItem, considerAmount));
        const similarItems = cashflowList.filter((_, index) => similarities[index] > similarThreshold);
        if(similarItems.length == 0) return null;

        return similarItems;
    }

    function mergeDuplicates(cashflowList) {
        return cashflowList.reduce((acc, cashflowWithSimilars) => {
            const similars = getSimilarItems(cashflowWithSimilars.item, acc.map(item => item.item), false);
            if(!similars) {
                acc.push(cashflowWithSimilars);
                cashflowWithSimilars.item.mergedItems = [];
            } else similars[0].mergedItems.push(cashflowWithSimilars.item);
            return acc;
        }, []);
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    // main/src/db.js
    const {app} = require('electron').remote;
    const Datastore = require('nedb-promises');

    const dbFactory = (fileName) => Datastore.create({
        filename: `${process.env.NODE_ENV === 'dev' ? '.' : app.getAppPath('userData')}/data/${fileName}`, 
        timestampData: true,
        autoload: true
    });

    const db = {
        cashflow: dbFactory('cashflow.db'),
        periodicals: dbFactory('periodicals.db')
    };

    const maxUpdateNumber = 10;

    function createDbCashflowHandler() {
        const { subscribe, update } = writable(0);

        let db$1 = db.cashflow;

        function triggerUpdate() {
            update(n => (n >= maxUpdateNumber) ? 0 : n + 1);
        }

        return {
            subscribe: (callback) => subscribe(async () => {
                const allCashFlows = await db$1.find({});
                callback(allCashFlows.map(item => new Cashflow(item)));
            }),
            addItem: async (item) => {
                await db$1.insert(item);
                triggerUpdate();
            }
        }
    }

    const maxUpdateNumber$1 = 10;

    function createDbPeriodicalHandler() {
        const { subscribe, update } = writable(0);

        let db$1 = db.periodicals;

        function triggerUpdate() {
            update(n => (n >= maxUpdateNumber$1) ? 0 : n + 1);
        }

        return {
            subscribe: (callback) => subscribe(async () => {
                const allPeriodicals = await db$1.find({});
                callback(allPeriodicals.map(periodical => new Periodical(periodical)));
            }),
            addItem: async (item) => {
                await db$1.insert(item);
                triggerUpdate();
            },
            updateItem: async (item) => {
                console.log(item);
                await db$1.update({_id: item._id}, item, {});
                triggerUpdate();
            },
            removeItem: async({_id}) => {
                await db$1.remove({ _id }, {});
                triggerUpdate();
            }
        }
    }

    const dbCashflow = createDbCashflowHandler();
    const dbPeriodicals = createDbPeriodicalHandler();

    class EditPeriodicalService {
        constructor() {
            this.show = false;
            this.periodical = null;
            this.listeners = [];
        }

        editItem(item) {
            this.periodical = item;
            this.show = true;
            this.notify();
        }

        createItem(item) {
            this.periodical = item ? item : new Periodical();
            this.show = true;
            this.notify();
        }

        resetAndClose() {
            this.show = false;
            this.periodical = null;
            this.notify();
        }

        register(func) {
            this.listeners.push(func);
        }

        notify() {
            this.listeners.forEach(func => func(this.show));
        }
    }

    var Singleton = (function () {
        var instance;
     
        function createInstance() {
            var object = new EditPeriodicalService();
            return object;
        }
     
        return {
            getInstance: function () {
                if (!instance) {
                    instance = createInstance();
                }
                return instance;
            }
        };
    })();

    var periodicalModalService = Singleton.getInstance();

    /* src\shared\components\Input.svelte generated by Svelte v3.21.0 */
    const file$a = "src\\shared\\components\\Input.svelte";

    // (23:4) {#if !!label}
    function create_if_block_2$1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*label*/ ctx[7]);
    			attr_dev(p, "class", "month svelte-iygpf0");
    			add_location(p, file$a, 23, 8, 620);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 128) set_data_dev(t, /*label*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(23:4) {#if !!label}",
    		ctx
    	});

    	return block;
    }

    // (30:8) {:else}
    function create_else_block$1(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			input.disabled = /*disabled*/ ctx[6];
    			attr_dev(input, "class", "svelte-iygpf0");
    			add_location(input, file$a, 30, 12, 859);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[11]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 16) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			}

    			if (dirty & /*disabled*/ 64) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[6]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(30:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:8) {#if type === "number"}
    function create_if_block_1$1(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			input.disabled = /*disabled*/ ctx[6];
    			attr_dev(input, "min", /*min*/ ctx[1]);
    			attr_dev(input, "max", /*max*/ ctx[2]);
    			attr_dev(input, "step", /*step*/ ctx[3]);
    			attr_dev(input, "class", "svelte-iygpf0");
    			add_location(input, file$a, 28, 12, 741);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[10]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 16) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			}

    			if (dirty & /*disabled*/ 64) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[6]);
    			}

    			if (dirty & /*min*/ 2) {
    				attr_dev(input, "min", /*min*/ ctx[1]);
    			}

    			if (dirty & /*max*/ 4) {
    				attr_dev(input, "max", /*max*/ ctx[2]);
    			}

    			if (dirty & /*step*/ 8) {
    				attr_dev(input, "step", /*step*/ ctx[3]);
    			}

    			if (dirty & /*value*/ 1 && to_number(input.value) !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(28:8) {#if type === \\\"number\\\"}",
    		ctx
    	});

    	return block;
    }

    // (34:8) {#if type === "number" && !disabled}
    function create_if_block$2(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let current;
    	let dispose;
    	const mdkeyboardarrowup = new MdKeyboardArrowUp({ $$inline: true });
    	const mdkeyboardarrowdown = new MdKeyboardArrowDown({ $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(mdkeyboardarrowup.$$.fragment);
    			t = space();
    			div1 = element("div");
    			create_component(mdkeyboardarrowdown.$$.fragment);
    			attr_dev(div0, "class", "icon svelte-iygpf0");
    			add_location(div0, file$a, 35, 16, 1046);
    			attr_dev(div1, "class", "icon svelte-iygpf0");
    			add_location(div1, file$a, 36, 16, 1139);
    			attr_dev(div2, "class", "number-arrows svelte-iygpf0");
    			add_location(div2, file$a, 34, 12, 1001);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(mdkeyboardarrowup, div0, null);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			mount_component(mdkeyboardarrowdown, div1, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div0, "click", /*click_handler*/ ctx[12], false, false, false),
    				listen_dev(div1, "click", /*click_handler_1*/ ctx[13], false, false, false)
    			];
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdkeyboardarrowup.$$.fragment, local);
    			transition_in(mdkeyboardarrowdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdkeyboardarrowup.$$.fragment, local);
    			transition_out(mdkeyboardarrowdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(mdkeyboardarrowup);
    			destroy_component(mdkeyboardarrowdown);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(34:8) {#if type === \\\"number\\\" && !disabled}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let current;
    	let if_block0 = !!/*label*/ ctx[7] && create_if_block_2$1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[5] === "number") return create_if_block_1$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);
    	let if_block2 = /*type*/ ctx[5] === "number" && !/*disabled*/ ctx[6] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div0, "class", "input-wrapper svelte-iygpf0");
    			add_location(div0, file$a, 26, 4, 667);
    			attr_dev(div1, "class", "input-form svelte-iygpf0");
    			add_location(div1, file$a, 21, 0, 567);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if_block1.m(div0, null);
    			append_dev(div0, t1);
    			if (if_block2) if_block2.m(div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!!/*label*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div0, t1);
    				}
    			}

    			if (/*type*/ ctx[5] === "number" && !/*disabled*/ ctx[6]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*type, disabled*/ 96) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$2(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { value } = $$props;
    	let { min = 0 } = $$props;
    	let { max = Number.MAX_SAFE_INTEGER } = $$props;
    	let { step = 1 } = $$props;
    	let { placeholder = "" } = $$props;
    	let { type = "number" } = $$props;
    	let { disabled = false } = $$props;
    	let { label = "" } = $$props;

    	function increase() {
    		if (value < max) $$invalidate(0, value++, value);
    	}

    	function decrease() {
    		if (value > min) $$invalidate(0, value--, value);
    	}

    	const writable_props = ["value", "min", "max", "step", "placeholder", "type", "disabled", "label"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Input", $$slots, []);

    	function input_input_handler() {
    		value = to_number(this.value);
    		$$invalidate(0, value);
    	}

    	function input_input_handler_1() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	const click_handler = () => increase();
    	const click_handler_1 = () => decrease();

    	$$self.$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("min" in $$props) $$invalidate(1, min = $$props.min);
    		if ("max" in $$props) $$invalidate(2, max = $$props.max);
    		if ("step" in $$props) $$invalidate(3, step = $$props.step);
    		if ("placeholder" in $$props) $$invalidate(4, placeholder = $$props.placeholder);
    		if ("type" in $$props) $$invalidate(5, type = $$props.type);
    		if ("disabled" in $$props) $$invalidate(6, disabled = $$props.disabled);
    		if ("label" in $$props) $$invalidate(7, label = $$props.label);
    	};

    	$$self.$capture_state = () => ({
    		MdKeyboardArrowUp,
    		MdKeyboardArrowDown,
    		value,
    		min,
    		max,
    		step,
    		placeholder,
    		type,
    		disabled,
    		label,
    		increase,
    		decrease
    	});

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("min" in $$props) $$invalidate(1, min = $$props.min);
    		if ("max" in $$props) $$invalidate(2, max = $$props.max);
    		if ("step" in $$props) $$invalidate(3, step = $$props.step);
    		if ("placeholder" in $$props) $$invalidate(4, placeholder = $$props.placeholder);
    		if ("type" in $$props) $$invalidate(5, type = $$props.type);
    		if ("disabled" in $$props) $$invalidate(6, disabled = $$props.disabled);
    		if ("label" in $$props) $$invalidate(7, label = $$props.label);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		min,
    		max,
    		step,
    		placeholder,
    		type,
    		disabled,
    		label,
    		increase,
    		decrease,
    		input_input_handler,
    		input_input_handler_1,
    		click_handler,
    		click_handler_1
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			value: 0,
    			min: 1,
    			max: 2,
    			step: 3,
    			placeholder: 4,
    			type: 5,
    			disabled: 6,
    			label: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<Input> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get min() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\shared\components\Checkbox.svelte generated by Svelte v3.21.0 */

    const file$b = "src\\shared\\components\\Checkbox.svelte";

    function create_fragment$b(ctx) {
    	let custom_checkbox;
    	let label_1;
    	let t0;
    	let t1;
    	let input;
    	let t2;
    	let span;
    	let dispose;

    	const block = {
    		c: function create() {
    			custom_checkbox = element("custom-checkbox");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			span = element("span");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "svelte-1i66pf9");
    			add_location(input, file$b, 8, 8, 159);
    			attr_dev(span, "class", "checkmark svelte-1i66pf9");
    			add_location(span, file$b, 9, 8, 215);
    			attr_dev(label_1, "class", "container svelte-1i66pf9");
    			add_location(label_1, file$b, 6, 4, 105);
    			set_custom_element_data(custom_checkbox, "class", "svelte-1i66pf9");
    			add_location(custom_checkbox, file$b, 5, 0, 82);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, custom_checkbox, anchor);
    			append_dev(custom_checkbox, label_1);
    			append_dev(label_1, t0);
    			append_dev(label_1, t1);
    			append_dev(label_1, input);
    			input.checked = /*checked*/ ctx[0];
    			append_dev(label_1, t2);
    			append_dev(label_1, span);
    			if (remount) dispose();
    			dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[2]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(custom_checkbox);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { checked = false } = $$props;
    	let { label = "" } = $$props;
    	const writable_props = ["checked", "label"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Checkbox> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Checkbox", $$slots, []);

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$set = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    	};

    	$$self.$capture_state = () => ({ checked, label });

    	$$self.$inject_state = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checked, label, input_change_handler];
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { checked: 0, label: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkbox",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get checked() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\views\main\cards\CashflowsCard.svelte generated by Svelte v3.21.0 */

    const { console: console_1 } = globals;
    const file$c = "src\\views\\main\\cards\\CashflowsCard.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i].name;
    	child_ctx[23] = list[i].active;
    	child_ctx[25] = i;
    	return child_ctx;
    }

    // (76:8) {#each flowLists as {name, active}
    function create_each_block$1(ctx) {
    	let div;
    	let t_value = /*name*/ ctx[22] + "";
    	let t;
    	let div_class_value;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[17](/*i*/ ctx[25], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", div_class_value = "" + (/*name*/ ctx[22] + " " + (/*active*/ ctx[23] ? "active" : "") + " svelte-uhiw44"));
    			add_location(div, file$c, 76, 12, 3031);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    			if (remount) dispose();
    			dispose = listen_dev(div, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*flowLists*/ 16 && t_value !== (t_value = /*name*/ ctx[22] + "")) set_data_dev(t, t_value);

    			if (dirty & /*flowLists*/ 16 && div_class_value !== (div_class_value = "" + (/*name*/ ctx[22] + " " + (/*active*/ ctx[23] ? "active" : "") + " svelte-uhiw44"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(76:8) {#each flowLists as {name, active}",
    		ctx
    	});

    	return block;
    }

    // (89:8) {#if flowLists[1].active}
    function create_if_block$3(ctx) {
    	let div0;
    	let updating_value;
    	let t;
    	let div1;
    	let updating_checked;
    	let div1_transition;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[20].call(null, value);
    	}

    	let input_props = {
    		type: "number",
    		label: "Depth",
    		placeholder: "depth",
    		min: "0",
    		step: "1"
    	};

    	if (/*periodicalDepth*/ ctx[2] !== void 0) {
    		input_props.value = /*periodicalDepth*/ ctx[2];
    	}

    	const input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));

    	function checkbox_checked_binding(value) {
    		/*checkbox_checked_binding*/ ctx[21].call(null, value);
    	}

    	let checkbox_props = { label: "Consider Amount" };

    	if (/*considerAmount*/ ctx[3] !== void 0) {
    		checkbox_props.checked = /*considerAmount*/ ctx[3];
    	}

    	const checkbox = new Checkbox({ props: checkbox_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox, "checked", checkbox_checked_binding));

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(input.$$.fragment);
    			t = space();
    			div1 = element("div");
    			create_component(checkbox.$$.fragment);
    			attr_dev(div0, "class", "input-form svelte-uhiw44");
    			add_location(div0, file$c, 89, 12, 3594);
    			attr_dev(div1, "class", "checkbox svelte-uhiw44");
    			add_location(div1, file$c, 93, 12, 3775);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(input, div0, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(checkbox, div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_value && dirty & /*periodicalDepth*/ 4) {
    				updating_value = true;
    				input_changes.value = /*periodicalDepth*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    			const checkbox_changes = {};

    			if (!updating_checked && dirty & /*considerAmount*/ 8) {
    				updating_checked = true;
    				checkbox_changes.checked = /*considerAmount*/ ctx[3];
    				add_flush_callback(() => updating_checked = false);
    			}

    			checkbox.$set(checkbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			transition_in(checkbox.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: 100, duration: 150 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			transition_out(checkbox.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: 100, duration: 150 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(input);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			destroy_component(checkbox);
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(89:8) {#if flowLists[1].active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let periodical_flow;
    	let div0;
    	let t0;
    	let div3;
    	let div1;
    	let updating_value;
    	let t1;
    	let div2;
    	let updating_value_1;
    	let t2;
    	let t3;
    	let current;
    	let each_value = /*flowLists*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	function input0_value_binding(value) {
    		/*input0_value_binding*/ ctx[18].call(null, value);
    	}

    	let input0_props = {
    		type: "number",
    		label: "Month",
    		placeholder: "month",
    		min: "1",
    		max: "12"
    	};

    	if (/*monthSelection*/ ctx[0] !== void 0) {
    		input0_props.value = /*monthSelection*/ ctx[0];
    	}

    	const input0 = new Input({ props: input0_props, $$inline: true });
    	binding_callbacks.push(() => bind(input0, "value", input0_value_binding));

    	function input1_value_binding(value) {
    		/*input1_value_binding*/ ctx[19].call(null, value);
    	}

    	let input1_props = {
    		type: "number",
    		label: "Year",
    		placeholder: "year",
    		min: "2000",
    		max: new Date().getFullYear() + 1
    	};

    	if (/*yearSelection*/ ctx[1] !== void 0) {
    		input1_props.value = /*yearSelection*/ ctx[1];
    	}

    	const input1 = new Input({ props: input1_props, $$inline: true });
    	binding_callbacks.push(() => bind(input1, "value", input1_value_binding));
    	let if_block = /*flowLists*/ ctx[4][1].active && create_if_block$3(ctx);

    	const sidebysidelist = new SideBySideList({
    			props: {
    				incomeFlow: /*activeFlow*/ ctx[5].income,
    				spendingFlow: /*activeFlow*/ ctx[5].spending,
    				isPeriodical: /*isPeriodical*/ ctx[6],
    				submenu: /*submenu*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			periodical_flow = element("periodical-flow");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			create_component(input0.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(input1.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			create_component(sidebysidelist.$$.fragment);
    			attr_dev(div0, "class", "flow-selector-wrapper svelte-uhiw44");
    			add_location(div0, file$c, 74, 4, 2934);
    			attr_dev(div1, "class", "input-form svelte-uhiw44");
    			add_location(div1, file$c, 80, 8, 3193);
    			attr_dev(div2, "class", "input-form svelte-uhiw44");
    			add_location(div2, file$c, 84, 8, 3360);
    			attr_dev(div3, "class", "input-fields svelte-uhiw44");
    			add_location(div3, file$c, 79, 4, 3157);
    			set_custom_element_data(periodical_flow, "class", "svelte-uhiw44");
    			add_location(periodical_flow, file$c, 73, 0, 2911);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, periodical_flow, anchor);
    			append_dev(periodical_flow, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(periodical_flow, t0);
    			append_dev(periodical_flow, div3);
    			append_dev(div3, div1);
    			mount_component(input0, div1, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			mount_component(input1, div2, null);
    			append_dev(div3, t2);
    			if (if_block) if_block.m(div3, null);
    			append_dev(periodical_flow, t3);
    			mount_component(sidebysidelist, periodical_flow, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*flowLists, setActiveList*/ 272) {
    				each_value = /*flowLists*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const input0_changes = {};

    			if (!updating_value && dirty & /*monthSelection*/ 1) {
    				updating_value = true;
    				input0_changes.value = /*monthSelection*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			input0.$set(input0_changes);
    			const input1_changes = {};

    			if (!updating_value_1 && dirty & /*yearSelection*/ 2) {
    				updating_value_1 = true;
    				input1_changes.value = /*yearSelection*/ ctx[1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			input1.$set(input1_changes);

    			if (/*flowLists*/ ctx[4][1].active) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*flowLists*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div3, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const sidebysidelist_changes = {};
    			if (dirty & /*activeFlow*/ 32) sidebysidelist_changes.incomeFlow = /*activeFlow*/ ctx[5].income;
    			if (dirty & /*activeFlow*/ 32) sidebysidelist_changes.spendingFlow = /*activeFlow*/ ctx[5].spending;
    			if (dirty & /*isPeriodical*/ 64) sidebysidelist_changes.isPeriodical = /*isPeriodical*/ ctx[6];
    			sidebysidelist.$set(sidebysidelist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input0.$$.fragment, local);
    			transition_in(input1.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(sidebysidelist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input0.$$.fragment, local);
    			transition_out(input1.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(sidebysidelist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(periodical_flow);
    			destroy_each(each_blocks, detaching);
    			destroy_component(input0);
    			destroy_component(input1);
    			if (if_block) if_block.d();
    			destroy_component(sidebysidelist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let monthSelection = new Date().getMonth();
    	if (monthSelection === 0) monthSelection = 12;
    	let yearSelection = new Date().getFullYear();
    	let periodicalDepth = 1;
    	let considerAmount = false;

    	let submenu = {
    		"+ periodicals": item => {
    			if (item.hasPeriodical()) periodicalModalService.editItem(item.periodical); else periodicalModalService.createItem(Periodical.fromCashflow(item));
    		},
    		"log": console.log
    	};

    	let cashflowList = [];
    	const unsubscribe = dbCashflow.subscribe(newCashflowList => $$invalidate(9, cashflowList = newCashflowList));
    	let periodicals = [];
    	const unsubscribePeriodical = dbPeriodicals.subscribe(newPeriodicals => $$invalidate(10, periodicals = newPeriodicals));
    	let flowLists = [{ name: "Monthly", active: true }, { name: "Periodical", active: false }];

    	function setActiveList(index) {
    		flowLists.forEach(listItem => listItem.active = false);
    		$$invalidate(4, flowLists[index].active = true, flowLists);
    		$$invalidate(5, activeFlow = flowLists[index].data);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<CashflowsCard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CashflowsCard", $$slots, []);
    	const click_handler = i => setActiveList(i);

    	function input0_value_binding(value) {
    		monthSelection = value;
    		$$invalidate(0, monthSelection);
    	}

    	function input1_value_binding(value) {
    		yearSelection = value;
    		$$invalidate(1, yearSelection);
    	}

    	function input_value_binding(value) {
    		periodicalDepth = value;
    		$$invalidate(2, periodicalDepth);
    	}

    	function checkbox_checked_binding(value) {
    		considerAmount = value;
    		$$invalidate(3, considerAmount);
    	}

    	$$self.$capture_state = () => ({
    		SideBySideList,
    		CashFlow: Cashflow,
    		Periodical,
    		CashflowAnalysis,
    		dateFilter,
    		dbCashflow,
    		dbPeriodicals,
    		periodicalModalService,
    		Input,
    		Checkbox,
    		fly,
    		monthSelection,
    		yearSelection,
    		periodicalDepth,
    		considerAmount,
    		submenu,
    		cashflowList,
    		unsubscribe,
    		periodicals,
    		unsubscribePeriodical,
    		flowLists,
    		setActiveList,
    		withPeriodicals,
    		flows,
    		monthlyFlows,
    		periodicalFlows,
    		activeFlow,
    		isPeriodical
    	});

    	$$self.$inject_state = $$props => {
    		if ("monthSelection" in $$props) $$invalidate(0, monthSelection = $$props.monthSelection);
    		if ("yearSelection" in $$props) $$invalidate(1, yearSelection = $$props.yearSelection);
    		if ("periodicalDepth" in $$props) $$invalidate(2, periodicalDepth = $$props.periodicalDepth);
    		if ("considerAmount" in $$props) $$invalidate(3, considerAmount = $$props.considerAmount);
    		if ("submenu" in $$props) $$invalidate(7, submenu = $$props.submenu);
    		if ("cashflowList" in $$props) $$invalidate(9, cashflowList = $$props.cashflowList);
    		if ("periodicals" in $$props) $$invalidate(10, periodicals = $$props.periodicals);
    		if ("flowLists" in $$props) $$invalidate(4, flowLists = $$props.flowLists);
    		if ("withPeriodicals" in $$props) $$invalidate(11, withPeriodicals = $$props.withPeriodicals);
    		if ("flows" in $$props) $$invalidate(12, flows = $$props.flows);
    		if ("monthlyFlows" in $$props) $$invalidate(13, monthlyFlows = $$props.monthlyFlows);
    		if ("periodicalFlows" in $$props) $$invalidate(14, periodicalFlows = $$props.periodicalFlows);
    		if ("activeFlow" in $$props) $$invalidate(5, activeFlow = $$props.activeFlow);
    		if ("isPeriodical" in $$props) $$invalidate(6, isPeriodical = $$props.isPeriodical);
    	};

    	let withPeriodicals;
    	let flows;
    	let monthlyFlows;
    	let periodicalFlows;
    	let activeFlow;
    	let isPeriodical;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*cashflowList, periodicals*/ 1536) {
    			 $$invalidate(11, withPeriodicals = cashflowList.map(cashflow => {
    				const periodical = periodicals.find(periodical => periodical.beneficiary === cashflow.beneficiary);
    				if (periodical) cashflow.setPeriodical(periodical);
    				return cashflow;
    			}));
    		}

    		if ($$self.$$.dirty & /*withPeriodicals*/ 2048) {
    			 $$invalidate(12, flows = {
    				income: withPeriodicals.filter(cashflow => cashflow.isIncome()),
    				spending: withPeriodicals.filter(cashflow => !cashflow.isIncome())
    			});
    		}

    		if ($$self.$$.dirty & /*flows, yearSelection, monthSelection*/ 4099) {
    			 $$invalidate(13, monthlyFlows = {
    				income: flows.income.filter(dateFilter(yearSelection, monthSelection)),
    				spending: flows.spending.filter(dateFilter(yearSelection, monthSelection))
    			});
    		}

    		if ($$self.$$.dirty & /*flows, periodicalDepth, considerAmount, monthSelection*/ 4109) {
    			 $$invalidate(14, periodicalFlows = {
    				income: new CashflowAnalysis(flows.income, periodicalDepth, considerAmount).getPeriodical(monthSelection).map(({ item }) => item),
    				spending: new CashflowAnalysis(flows.spending, periodicalDepth, considerAmount).getPeriodical(monthSelection).map(({ item }) => item)
    			});
    		}

    		if ($$self.$$.dirty & /*monthlyFlows, periodicalFlows, flowLists*/ 24592) {
    			 $$invalidate(5, activeFlow = [monthlyFlows, periodicalFlows].find((item, index) => flowLists[index].active));
    		}

    		if ($$self.$$.dirty & /*flowLists*/ 16) {
    			 $$invalidate(6, isPeriodical = flowLists[1].active);
    		}
    	};

    	return [
    		monthSelection,
    		yearSelection,
    		periodicalDepth,
    		considerAmount,
    		flowLists,
    		activeFlow,
    		isPeriodical,
    		submenu,
    		setActiveList,
    		cashflowList,
    		periodicals,
    		withPeriodicals,
    		flows,
    		monthlyFlows,
    		periodicalFlows,
    		unsubscribe,
    		unsubscribePeriodical,
    		click_handler,
    		input0_value_binding,
    		input1_value_binding,
    		input_value_binding,
    		checkbox_checked_binding
    	];
    }

    class CashflowsCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CashflowsCard",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\views\main\cards\AllFlows.svelte generated by Svelte v3.21.0 */

    const file$d = "src\\views\\main\\cards\\AllFlows.svelte";

    function create_fragment$d(ctx) {
    	let allflows;

    	const block = {
    		c: function create() {
    			allflows = element("allflows");
    			allflows.textContent = "Test";
    			attr_dev(allflows, "class", "svelte-1a7faa8");
    			add_location(allflows, file$d, 2, 0, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, allflows, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(allflows);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AllFlows> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AllFlows", $$slots, []);
    	return [];
    }

    class AllFlows extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AllFlows",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* node_modules\svelte-icons\md\MdAdd.svelte generated by Svelte v3.21.0 */
    const file$e = "node_modules\\svelte-icons\\md\\MdAdd.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$7(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z");
    			add_location(path, file$e, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$7] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	const iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MdAdd", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdAdd extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdAdd",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\views\main\components\PeriodicalList.svelte generated by Svelte v3.21.0 */

    const { Object: Object_1$1 } = globals;
    const file$f = "src\\views\\main\\components\\PeriodicalList.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    // (73:0) {#if filteredList.length > 0 && withSorting}
    function create_if_block_3$1(ctx) {
    	let div;
    	let current;
    	let each_value_2 = /*columns*/ ctx[9];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "filter-buttons svelte-ozletf");
    			add_location(div, file$f, 73, 4, 2232);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*columns, sorting, setSorting, reverse*/ 1560) {
    				each_value_2 = /*columns*/ ctx[9];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(73:0) {#if filteredList.length > 0 && withSorting}",
    		ctx
    	});

    	return block;
    }

    // (79:16) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const mdkeyboardarrowdown = new MdKeyboardArrowDown({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mdkeyboardarrowdown.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mdkeyboardarrowdown, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdkeyboardarrowdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdkeyboardarrowdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mdkeyboardarrowdown, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(79:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (77:16) {#if reverse}
    function create_if_block_4$1(ctx) {
    	let current;
    	const mdkeyboardarrowup = new MdKeyboardArrowUp({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mdkeyboardarrowup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mdkeyboardarrowup, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdkeyboardarrowup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdkeyboardarrowup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mdkeyboardarrowup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(77:16) {#if reverse}",
    		ctx
    	});

    	return block;
    }

    // (75:8) {#each columns as column}
    function create_each_block_2$1(ctx) {
    	let span;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let span_class_value;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block_4$1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*reverse*/ ctx[4]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[18](/*column*/ ctx[26], ...args);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if_block.c();
    			t = space();
    			attr_dev(span, "class", span_class_value = "icon " + /*column*/ ctx[26].css + " svelte-ozletf");
    			toggle_class(span, "active", /*sorting*/ ctx[3] === /*column*/ ctx[26].name);
    			add_location(span, file$f, 75, 12, 2309);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, span, anchor);
    			if_blocks[current_block_type_index].m(span, null);
    			append_dev(span, t);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(span, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(span, t);
    			}

    			if (dirty & /*sorting, columns*/ 520) {
    				toggle_class(span, "active", /*sorting*/ ctx[3] === /*column*/ ctx[26].name);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if_blocks[current_block_type_index].d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(75:8) {#each columns as column}",
    		ctx
    	});

    	return block;
    }

    // (96:20) {#if periodical.comment}
    function create_if_block_2$2(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*periodical*/ ctx[21].comment + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*periodical*/ ctx[21].comment + "";
    	let t2;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			attr_dev(div0, "class", "usageText svelte-ozletf");
    			add_location(div0, file$f, 97, 28, 3152);
    			attr_dev(div1, "class", "tooltip svelte-ozletf");
    			toggle_class(div1, "last", /*i*/ ctx[23] + 1 === /*filteredAndIncomeSortedFlows*/ ctx[6].length);
    			add_location(div1, file$f, 101, 28, 3297);
    			attr_dev(div2, "class", "tooltip-wrapper svelte-ozletf");
    			add_location(div2, file$f, 96, 24, 3093);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredAndIncomeSortedFlows*/ 64 && t0_value !== (t0_value = /*periodical*/ ctx[21].comment + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*filteredAndIncomeSortedFlows*/ 64 && t2_value !== (t2_value = /*periodical*/ ctx[21].comment + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*filteredAndIncomeSortedFlows*/ 64) {
    				toggle_class(div1, "last", /*i*/ ctx[23] + 1 === /*filteredAndIncomeSortedFlows*/ ctx[6].length);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(96:20) {#if periodical.comment}",
    		ctx
    	});

    	return block;
    }

    // (117:12) {#if showSubmenu === i}
    function create_if_block_1$2(ctx) {
    	let li;
    	let t;
    	let li_transition;
    	let current;
    	let each_value_1 = /*submenuItems*/ ctx[8];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			li = element("li");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(li, "class", "submenu svelte-ozletf");
    			add_location(li, file$f, 117, 16, 3940);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(li, null);
    			}

    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*callSubmenu, submenuItems, filteredAndIncomeSortedFlows*/ 4416) {
    				each_value_1 = /*submenuItems*/ ctx[8];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(li, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!li_transition) li_transition = create_bidirectional_transition(li, slide, {}, true);
    				li_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!li_transition) li_transition = create_bidirectional_transition(li, slide, {}, false);
    			li_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_each(each_blocks, detaching);
    			if (detaching && li_transition) li_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(117:12) {#if showSubmenu === i}",
    		ctx
    	});

    	return block;
    }

    // (119:20) {#each submenuItems as submenuItem, i}
    function create_each_block_1$1(ctx) {
    	let div;
    	let t_value = /*submenuItem*/ ctx[24] + "";
    	let t;
    	let dispose;

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[20](/*submenuItem*/ ctx[24], /*periodical*/ ctx[21], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-ozletf");
    			add_location(div, file$f, 119, 24, 4063);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    			if (remount) dispose();
    			dispose = listen_dev(div, "click", stop_propagation(click_handler_2), false, false, true);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*submenuItems*/ 256 && t_value !== (t_value = /*submenuItem*/ ctx[24] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(119:20) {#each submenuItems as submenuItem, i}",
    		ctx
    	});

    	return block;
    }

    // (89:8) {#each filteredAndIncomeSortedFlows as periodical, i}
    function create_each_block$2(ctx) {
    	let li;
    	let span0;
    	let p;
    	let t0_value = /*periodical*/ ctx[21].beneficiary + "";
    	let t0;
    	let t1;
    	let t2;
    	let div;
    	let span1;
    	let t3_value = /*periodical*/ ctx[21].getAmount().toFixed(2) + "";
    	let t3;
    	let t4;
    	let div_class_value;
    	let li_transition;
    	let t5;
    	let if_block1_anchor;
    	let current;
    	let dispose;
    	let if_block0 = /*periodical*/ ctx[21].comment && create_if_block_2$2(ctx);

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[19](/*i*/ ctx[23], ...args);
    	}

    	let if_block1 = /*showSubmenu*/ ctx[2] === /*i*/ ctx[23] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			span0 = element("span");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			div = element("div");
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = text(" €");
    			t5 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(p, "class", "svelte-ozletf");
    			add_location(p, file$f, 94, 20, 2990);
    			attr_dev(span0, "class", "text svelte-ozletf");
    			add_location(span0, file$f, 93, 16, 2949);
    			attr_dev(span1, "class", "amount svelte-ozletf");
    			add_location(span1, file$f, 108, 20, 3670);

    			attr_dev(div, "class", div_class_value = "amount-wrapper " + (/*periodical*/ ctx[21].isIncome()
    			? "income"
    			: "spending") + " svelte-ozletf");

    			add_location(div, file$f, 107, 16, 3571);
    			attr_dev(li, "class", "flow-item svelte-ozletf");
    			add_location(li, file$f, 89, 12, 2765);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span0);
    			append_dev(span0, p);
    			append_dev(p, t0);
    			append_dev(span0, t1);
    			if (if_block0) if_block0.m(span0, null);
    			append_dev(li, t2);
    			append_dev(li, div);
    			append_dev(div, span1);
    			append_dev(span1, t3);
    			append_dev(span1, t4);
    			insert_dev(target, t5, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(li, "click", click_handler_1, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*filteredAndIncomeSortedFlows*/ 64) && t0_value !== (t0_value = /*periodical*/ ctx[21].beneficiary + "")) set_data_dev(t0, t0_value);

    			if (/*periodical*/ ctx[21].comment) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					if_block0.m(span0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty & /*filteredAndIncomeSortedFlows*/ 64) && t3_value !== (t3_value = /*periodical*/ ctx[21].getAmount().toFixed(2) + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*filteredAndIncomeSortedFlows*/ 64 && div_class_value !== (div_class_value = "amount-wrapper " + (/*periodical*/ ctx[21].isIncome()
    			? "income"
    			: "spending") + " svelte-ozletf")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (/*showSubmenu*/ ctx[2] === /*i*/ ctx[23]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showSubmenu*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!li_transition) li_transition = create_bidirectional_transition(
    					li,
    					fly,
    					{
    						x: -100,
    						duration: 150,
    						delay: /*i*/ ctx[23] * 40
    					},
    					true
    				);

    				li_transition.run(1);
    			});

    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			if (!li_transition) li_transition = create_bidirectional_transition(
    				li,
    				fly,
    				{
    					x: -100,
    					duration: 150,
    					delay: /*i*/ ctx[23] * 40
    				},
    				false
    			);

    			li_transition.run(0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if (detaching && li_transition) li_transition.end();
    			if (detaching) detach_dev(t5);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(89:8) {#each filteredAndIncomeSortedFlows as periodical, i}",
    		ctx
    	});

    	return block;
    }

    // (130:0) {#if showTotalAmount}
    function create_if_block$4(ctx) {
    	let div;
    	let t0_value = /*totalAmount*/ ctx[7].toFixed(2) + "";
    	let t0;
    	let t1;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(" €");
    			attr_dev(div, "class", div_class_value = "total-amount " + (/*totalAmount*/ ctx[7] >= 0 ? "income" : "spending") + " svelte-ozletf");
    			add_location(div, file$f, 130, 4, 4366);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*totalAmount*/ 128 && t0_value !== (t0_value = /*totalAmount*/ ctx[7].toFixed(2) + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*totalAmount*/ 128 && div_class_value !== (div_class_value = "total-amount " + (/*totalAmount*/ ctx[7] >= 0 ? "income" : "spending") + " svelte-ozletf")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(130:0) {#if showTotalAmount}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let t0;
    	let div;
    	let ul;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*filteredList*/ ctx[5].length > 0 && /*withSorting*/ ctx[0] && create_if_block_3$1(ctx);
    	let each_value = /*filteredAndIncomeSortedFlows*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block1 = /*showTotalAmount*/ ctx[1] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(ul, "class", "svelte-ozletf");
    			add_location(ul, file$f, 87, 4, 2684);
    			attr_dev(div, "class", "flow-list svelte-ozletf");
    			add_location(div, file$f, 86, 0, 2655);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*filteredList*/ ctx[5].length > 0 && /*withSorting*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*filteredList, withSorting*/ 33) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*submenuItems, callSubmenu, filteredAndIncomeSortedFlows, showSubmenu, toggleSubmenu*/ 6468) {
    				each_value = /*filteredAndIncomeSortedFlows*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*showTotalAmount*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { title = "Cash Flow List" } = $$props;
    	let { periodicalList = [] } = $$props;
    	let { searchValue = "" } = $$props;
    	let { withSorting = true } = $$props;
    	let { showTotalAmount = true } = $$props;
    	let { submenu = {} } = $$props;
    	let showSubmenu = null;
    	let sorting = "beneficiary";
    	let reverse = false;
    	const columns = [{ name: "beneficiary", css: "text" }, { name: "amount", css: "amount" }];

    	function setSorting(name) {
    		$$invalidate(4, reverse = name === sorting ? !reverse : false);
    		$$invalidate(3, sorting = name);
    	}

    	function toggleSubmenu(index) {
    		if (showSubmenu === index) closeSubmenu(); else $$invalidate(2, showSubmenu = index);
    	}

    	function closeSubmenu() {
    		$$invalidate(2, showSubmenu = null);
    	}

    	function callSubmenu(item, parameter) {
    		submenu[item](parameter);
    	}

    	const writable_props = [
    		"title",
    		"periodicalList",
    		"searchValue",
    		"withSorting",
    		"showTotalAmount",
    		"submenu"
    	];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PeriodicalList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PeriodicalList", $$slots, []);
    	const click_handler = column => setSorting(column.name);
    	const click_handler_1 = i => toggleSubmenu(i);
    	const click_handler_2 = (submenuItem, periodical) => callSubmenu(submenuItem, periodical);

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(13, title = $$props.title);
    		if ("periodicalList" in $$props) $$invalidate(14, periodicalList = $$props.periodicalList);
    		if ("searchValue" in $$props) $$invalidate(15, searchValue = $$props.searchValue);
    		if ("withSorting" in $$props) $$invalidate(0, withSorting = $$props.withSorting);
    		if ("showTotalAmount" in $$props) $$invalidate(1, showTotalAmount = $$props.showTotalAmount);
    		if ("submenu" in $$props) $$invalidate(16, submenu = $$props.submenu);
    	};

    	$$self.$capture_state = () => ({
    		MdKeyboardArrowUp,
    		MdKeyboardArrowDown,
    		MdClose,
    		fly,
    		slide,
    		title,
    		periodicalList,
    		searchValue,
    		withSorting,
    		showTotalAmount,
    		submenu,
    		showSubmenu,
    		sorting,
    		reverse,
    		columns,
    		setSorting,
    		toggleSubmenu,
    		closeSubmenu,
    		callSubmenu,
    		filteredList,
    		filteredAndIncomeSortedFlows,
    		totalAmount,
    		submenuItems
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(13, title = $$props.title);
    		if ("periodicalList" in $$props) $$invalidate(14, periodicalList = $$props.periodicalList);
    		if ("searchValue" in $$props) $$invalidate(15, searchValue = $$props.searchValue);
    		if ("withSorting" in $$props) $$invalidate(0, withSorting = $$props.withSorting);
    		if ("showTotalAmount" in $$props) $$invalidate(1, showTotalAmount = $$props.showTotalAmount);
    		if ("submenu" in $$props) $$invalidate(16, submenu = $$props.submenu);
    		if ("showSubmenu" in $$props) $$invalidate(2, showSubmenu = $$props.showSubmenu);
    		if ("sorting" in $$props) $$invalidate(3, sorting = $$props.sorting);
    		if ("reverse" in $$props) $$invalidate(4, reverse = $$props.reverse);
    		if ("filteredList" in $$props) $$invalidate(5, filteredList = $$props.filteredList);
    		if ("filteredAndIncomeSortedFlows" in $$props) $$invalidate(6, filteredAndIncomeSortedFlows = $$props.filteredAndIncomeSortedFlows);
    		if ("totalAmount" in $$props) $$invalidate(7, totalAmount = $$props.totalAmount);
    		if ("submenuItems" in $$props) $$invalidate(8, submenuItems = $$props.submenuItems);
    	};

    	let filteredList;
    	let filteredAndIncomeSortedFlows;
    	let totalAmount;
    	let submenuItems;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*periodicalList, searchValue, sorting, reverse*/ 49176) {
    			 $$invalidate(5, filteredList = periodicalList.filter(({ usageText, beneficiary }) => beneficiary.toLowerCase().includes(searchValue.toLowerCase())).sort((a, b) => {
    				if (typeof a[sorting] === "string") return ("" + (reverse ? b : a)[sorting]).localeCompare((reverse ? a : b)[sorting]);
    				if (sorting === "amount") return (reverse ? b : a).getTotalAmount() - (reverse ? a : b).getTotalAmount();
    				return (reverse ? b : a)[sorting] - (reverse ? a : b)[sorting];
    			}));
    		}

    		if ($$self.$$.dirty & /*filteredList*/ 32) {
    			 if (filteredList) {
    				closeSubmenu();
    			}
    		}

    		if ($$self.$$.dirty & /*filteredList*/ 32) {
    			 $$invalidate(6, filteredAndIncomeSortedFlows = [
    				...filteredList.filter(cashflow => cashflow.isIncome()),
    				...filteredList.filter(cashflow => !cashflow.isIncome()).reverse()
    			]);
    		}

    		if ($$self.$$.dirty & /*filteredList*/ 32) {
    			 $$invalidate(7, totalAmount = filteredList.reduce((acc, item) => acc + item.getTotalAmount(), 0));
    		}

    		if ($$self.$$.dirty & /*submenu*/ 65536) {
    			 $$invalidate(8, submenuItems = Object.keys(submenu));
    		}
    	};

    	return [
    		withSorting,
    		showTotalAmount,
    		showSubmenu,
    		sorting,
    		reverse,
    		filteredList,
    		filteredAndIncomeSortedFlows,
    		totalAmount,
    		submenuItems,
    		columns,
    		setSorting,
    		toggleSubmenu,
    		callSubmenu,
    		title,
    		periodicalList,
    		searchValue,
    		submenu,
    		closeSubmenu,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class PeriodicalList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			title: 13,
    			periodicalList: 14,
    			searchValue: 15,
    			withSorting: 0,
    			showTotalAmount: 1,
    			submenu: 16
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PeriodicalList",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get title() {
    		throw new Error("<PeriodicalList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<PeriodicalList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get periodicalList() {
    		throw new Error("<PeriodicalList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set periodicalList(value) {
    		throw new Error("<PeriodicalList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchValue() {
    		throw new Error("<PeriodicalList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchValue(value) {
    		throw new Error("<PeriodicalList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withSorting() {
    		throw new Error("<PeriodicalList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withSorting(value) {
    		throw new Error("<PeriodicalList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showTotalAmount() {
    		throw new Error("<PeriodicalList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showTotalAmount(value) {
    		throw new Error("<PeriodicalList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get submenu() {
    		throw new Error("<PeriodicalList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set submenu(value) {
    		throw new Error("<PeriodicalList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\views\main\cards\PeriodicalsCard.svelte generated by Svelte v3.21.0 */
    const file$g = "src\\views\\main\\cards\\PeriodicalsCard.svelte";

    function create_fragment$g(ctx) {
    	let periodicals_1;
    	let div0;
    	let t0;
    	let div1;
    	let span;
    	let t1;
    	let t2;
    	let div2;
    	let t3;
    	let div3;
    	let t4_value = /*balance*/ ctx[1].toFixed(2) + "";
    	let t4;
    	let t5;
    	let div3_class_value;
    	let current;
    	let dispose;
    	const mdadd = new MdAdd({ $$inline: true });

    	const periodicallist = new PeriodicalList({
    			props: {
    				periodicalList: /*periodicals*/ ctx[0],
    				submenu: /*submenu*/ ctx[2],
    				showTotalAmount: false
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			periodicals_1 = element("periodicals");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			span = element("span");
    			create_component(mdadd.$$.fragment);
    			t1 = text("\r\n        Add");
    			t2 = space();
    			div2 = element("div");
    			create_component(periodicallist.$$.fragment);
    			t3 = space();
    			div3 = element("div");
    			t4 = text(t4_value);
    			t5 = text(" €");
    			attr_dev(div0, "class", "search svelte-zp7wou");
    			add_location(div0, file$g, 29, 4, 878);
    			attr_dev(span, "class", "icon svelte-zp7wou");
    			add_location(span, file$g, 31, 8, 977);
    			attr_dev(div1, "class", "add-button svelte-zp7wou");
    			add_location(div1, file$g, 30, 4, 910);
    			attr_dev(div2, "class", "list svelte-zp7wou");
    			add_location(div2, file$g, 35, 4, 1045);
    			attr_dev(div3, "class", div3_class_value = "balance  " + (/*balance*/ ctx[1] < 0 ? "negative" : "positive") + " svelte-zp7wou");
    			add_location(div3, file$g, 43, 4, 1240);
    			attr_dev(periodicals_1, "class", "svelte-zp7wou");
    			add_location(periodicals_1, file$g, 28, 0, 859);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, periodicals_1, anchor);
    			append_dev(periodicals_1, div0);
    			append_dev(periodicals_1, t0);
    			append_dev(periodicals_1, div1);
    			append_dev(div1, span);
    			mount_component(mdadd, span, null);
    			append_dev(div1, t1);
    			append_dev(periodicals_1, t2);
    			append_dev(periodicals_1, div2);
    			mount_component(periodicallist, div2, null);
    			append_dev(periodicals_1, t3);
    			append_dev(periodicals_1, div3);
    			append_dev(div3, t4);
    			append_dev(div3, t5);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div1, "click", /*click_handler*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			const periodicallist_changes = {};
    			if (dirty & /*periodicals*/ 1) periodicallist_changes.periodicalList = /*periodicals*/ ctx[0];
    			periodicallist.$set(periodicallist_changes);
    			if ((!current || dirty & /*balance*/ 2) && t4_value !== (t4_value = /*balance*/ ctx[1].toFixed(2) + "")) set_data_dev(t4, t4_value);

    			if (!current || dirty & /*balance*/ 2 && div3_class_value !== (div3_class_value = "balance  " + (/*balance*/ ctx[1] < 0 ? "negative" : "positive") + " svelte-zp7wou")) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdadd.$$.fragment, local);
    			transition_in(periodicallist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdadd.$$.fragment, local);
    			transition_out(periodicallist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(periodicals_1);
    			destroy_component(mdadd);
    			destroy_component(periodicallist);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function removeItem(item) {
    	dbPeriodicals.removeItem(item);
    }

    function addPeriodical() {
    	periodicalModalService.createItem();
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let searchValue = "";

    	let submenu = {
    		"edit": item => periodicalModalService.editItem(item),
    		"- remove": removeItem
    	};

    	let periodicals = [];
    	const unsubscribe = dbPeriodicals.subscribe(newPeriodicals => $$invalidate(0, periodicals = newPeriodicals));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PeriodicalsCard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PeriodicalsCard", $$slots, []);
    	const click_handler = () => addPeriodical();

    	$$self.$capture_state = () => ({
    		MdAdd,
    		dbPeriodicals,
    		PeriodicalList,
    		periodicalModalService,
    		searchValue,
    		submenu,
    		periodicals,
    		unsubscribe,
    		removeItem,
    		addPeriodical,
    		balance
    	});

    	$$self.$inject_state = $$props => {
    		if ("searchValue" in $$props) searchValue = $$props.searchValue;
    		if ("submenu" in $$props) $$invalidate(2, submenu = $$props.submenu);
    		if ("periodicals" in $$props) $$invalidate(0, periodicals = $$props.periodicals);
    		if ("balance" in $$props) $$invalidate(1, balance = $$props.balance);
    	};

    	let balance;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*periodicals*/ 1) {
    			 $$invalidate(1, balance = periodicals.reduce((balance, periodical) => balance + periodical.getTotalAmount(), 0));
    		}
    	};

    	return [periodicals, balance, submenu, searchValue, unsubscribe, click_handler];
    }

    class PeriodicalsCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PeriodicalsCard",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\views\main\Card.svelte generated by Svelte v3.21.0 */

    const { console: console_1$1 } = globals;
    const file$h = "src\\views\\main\\Card.svelte";

    // (62:26) 
    function create_if_block_2$3(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	let dispose;
    	const periodicalscard_spread_levels = [/*props*/ ctx[0]];
    	let periodicalscard_props = {};

    	for (let i = 0; i < periodicalscard_spread_levels.length; i += 1) {
    		periodicalscard_props = assign(periodicalscard_props, periodicalscard_spread_levels[i]);
    	}

    	const periodicalscard = new PeriodicalsCard({
    			props: periodicalscard_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(periodicalscard.$$.fragment);
    			attr_dev(div, "class", "card svelte-1ri8iju");
    			add_location(div, file$h, 62, 4, 1844);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			mount_component(periodicalscard, div, null);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div, "outroend", /*outroend_handler_2*/ ctx[17], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			const periodicalscard_changes = (dirty & /*props*/ 1)
    			? get_spread_update(periodicalscard_spread_levels, [get_spread_object(/*props*/ ctx[0])])
    			: {};

    			periodicalscard.$set(periodicalscard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(periodicalscard.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, /*inAnimation*/ ctx[2]);
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(periodicalscard.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, /*outAnimation*/ ctx[3]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(periodicalscard);
    			if (detaching && div_outro) div_outro.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(62:26) ",
    		ctx
    	});

    	return block;
    }

    // (55:18) 
    function create_if_block_1$3(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	let dispose;
    	const allflows_spread_levels = [/*props*/ ctx[0]];
    	let allflows_props = {};

    	for (let i = 0; i < allflows_spread_levels.length; i += 1) {
    		allflows_props = assign(allflows_props, allflows_spread_levels[i]);
    	}

    	const allflows = new AllFlows({ props: allflows_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(allflows.$$.fragment);
    			attr_dev(div, "class", "card svelte-1ri8iju");
    			add_location(div, file$h, 55, 4, 1633);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			mount_component(allflows, div, null);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div, "outroend", /*outroend_handler_1*/ ctx[16], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			const allflows_changes = (dirty & /*props*/ 1)
    			? get_spread_update(allflows_spread_levels, [get_spread_object(/*props*/ ctx[0])])
    			: {};

    			allflows.$set(allflows_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(allflows.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, /*inAnimation*/ ctx[2]);
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(allflows.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, /*outAnimation*/ ctx[3]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(allflows);
    			if (detaching && div_outro) div_outro.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(55:18) ",
    		ctx
    	});

    	return block;
    }

    // (48:0) {#if showCashflows}
    function create_if_block$5(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	let dispose;
    	const cashflowscard_spread_levels = [/*props*/ ctx[0]];
    	let cashflowscard_props = {};

    	for (let i = 0; i < cashflowscard_spread_levels.length; i += 1) {
    		cashflowscard_props = assign(cashflowscard_props, cashflowscard_spread_levels[i]);
    	}

    	const cashflowscard = new CashflowsCard({
    			props: cashflowscard_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(cashflowscard.$$.fragment);
    			attr_dev(div, "class", "card svelte-1ri8iju");
    			add_location(div, file$h, 48, 4, 1420);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			mount_component(cashflowscard, div, null);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div, "outroend", /*outroend_handler*/ ctx[15], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			const cashflowscard_changes = (dirty & /*props*/ 1)
    			? get_spread_update(cashflowscard_spread_levels, [get_spread_object(/*props*/ ctx[0])])
    			: {};

    			cashflowscard.$set(cashflowscard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cashflowscard.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, /*inAnimation*/ ctx[2]);
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cashflowscard.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, /*outAnimation*/ ctx[3]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(cashflowscard);
    			if (detaching && div_outro) div_outro.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(48:0) {#if showCashflows}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[14]);
    	const if_block_creators = [create_if_block$5, create_if_block_1$3, create_if_block_2$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*showCashflows*/ ctx[4]) return 0;
    		if (/*showAll*/ ctx[5]) return 1;
    		if (/*showPeriodicals*/ ctx[6]) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(window, "resize", /*onwindowresize*/ ctx[14]);
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { type = "cashflows" } = $$props;
    	let { props } = $$props;
    	let activeType = "cashflows";
    	let typeChanged = false;
    	let windowHeight;
    	let duration = 400;
    	let dirDown = true;
    	let availableCardNames = ["cashflows", "all-flows", "periodicals"];

    	async function outroEnded() {
    		$$invalidate(9, activeType = type);
    		$$invalidate(10, typeChanged = false);
    	}

    	const writable_props = ["type", "props"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Card", $$slots, []);

    	function onwindowresize() {
    		$$invalidate(1, windowHeight = window.outerHeight);
    	}

    	const outroend_handler = () => outroEnded();
    	const outroend_handler_1 = () => outroEnded();
    	const outroend_handler_2 = () => outroEnded();

    	$$self.$set = $$props => {
    		if ("type" in $$props) $$invalidate(8, type = $$props.type);
    		if ("props" in $$props) $$invalidate(0, props = $$props.props);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		expoIn,
    		expoOut,
    		CashflowsCard,
    		AllFlows,
    		PeriodicalsCard,
    		type,
    		props,
    		activeType,
    		typeChanged,
    		windowHeight,
    		duration,
    		dirDown,
    		availableCardNames,
    		outroEnded,
    		inAnimation,
    		outAnimation,
    		showCashflows,
    		showAll,
    		showPeriodicals
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(8, type = $$props.type);
    		if ("props" in $$props) $$invalidate(0, props = $$props.props);
    		if ("activeType" in $$props) $$invalidate(9, activeType = $$props.activeType);
    		if ("typeChanged" in $$props) $$invalidate(10, typeChanged = $$props.typeChanged);
    		if ("windowHeight" in $$props) $$invalidate(1, windowHeight = $$props.windowHeight);
    		if ("duration" in $$props) $$invalidate(12, duration = $$props.duration);
    		if ("dirDown" in $$props) $$invalidate(11, dirDown = $$props.dirDown);
    		if ("availableCardNames" in $$props) $$invalidate(13, availableCardNames = $$props.availableCardNames);
    		if ("inAnimation" in $$props) $$invalidate(2, inAnimation = $$props.inAnimation);
    		if ("outAnimation" in $$props) $$invalidate(3, outAnimation = $$props.outAnimation);
    		if ("showCashflows" in $$props) $$invalidate(4, showCashflows = $$props.showCashflows);
    		if ("showAll" in $$props) $$invalidate(5, showAll = $$props.showAll);
    		if ("showPeriodicals" in $$props) $$invalidate(6, showPeriodicals = $$props.showPeriodicals);
    	};

    	let inAnimation;
    	let outAnimation;
    	let showCashflows;
    	let showAll;
    	let showPeriodicals;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type, activeType*/ 768) {
    			 if (type != activeType) {
    				$$invalidate(10, typeChanged = true);
    				$$invalidate(11, dirDown = availableCardNames.indexOf(activeType) < availableCardNames.indexOf(type));
    			}
    		}

    		if ($$self.$$.dirty & /*windowHeight*/ 2) {
    			 {
    				console.log(windowHeight);
    			}
    		}

    		if ($$self.$$.dirty & /*dirDown, windowHeight*/ 2050) {
    			 $$invalidate(2, inAnimation = {
    				y: (dirDown ? 1 : -1) * windowHeight,
    				duration,
    				easing: expoOut
    			});
    		}

    		if ($$self.$$.dirty & /*dirDown, windowHeight*/ 2050) {
    			 $$invalidate(3, outAnimation = {
    				y: (dirDown ? -1 : 1) * windowHeight,
    				duration,
    				easing: expoIn
    			});
    		}

    		if ($$self.$$.dirty & /*activeType, typeChanged*/ 1536) {
    			 $$invalidate(4, showCashflows = activeType === availableCardNames[0] && !typeChanged);
    		}

    		if ($$self.$$.dirty & /*activeType, typeChanged*/ 1536) {
    			 $$invalidate(5, showAll = activeType === availableCardNames[1] && !typeChanged);
    		}

    		if ($$self.$$.dirty & /*activeType, typeChanged*/ 1536) {
    			 $$invalidate(6, showPeriodicals = activeType === availableCardNames[2] && !typeChanged);
    		}
    	};

    	return [
    		props,
    		windowHeight,
    		inAnimation,
    		outAnimation,
    		showCashflows,
    		showAll,
    		showPeriodicals,
    		outroEnded,
    		type,
    		activeType,
    		typeChanged,
    		dirDown,
    		duration,
    		availableCardNames,
    		onwindowresize,
    		outroend_handler,
    		outroend_handler_1,
    		outroend_handler_2
    	];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { type: 8, props: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*props*/ ctx[0] === undefined && !("props" in props)) {
    			console_1$1.warn("<Card> was created without expected prop 'props'");
    		}
    	}

    	get type() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get props() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class Card$1 {
        constructor(type) {
            this.type = type;
            this.props = {};
        }

        setProps(props) {
            this.props = props;
        }
    }

    /* src\views\main\upload-area\SelectDbFile.svelte generated by Svelte v3.21.0 */
    const file$i = "src\\views\\main\\upload-area\\SelectDbFile.svelte";

    function create_fragment$i(ctx) {
    	let div0;
    	let input;
    	let t0;
    	let p0;
    	let t1;
    	let i0;
    	let t3;
    	let div1;
    	let p1;
    	let t4;
    	let i1;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			p0 = element("p");
    			t1 = text("Database File ");
    			i0 = element("i");
    			i0.textContent = "Import";
    			t3 = space();
    			div1 = element("div");
    			p1 = element("p");
    			t4 = text("Database File ");
    			i1 = element("i");
    			i1.textContent = "Export";
    			attr_dev(input, "type", "file");
    			attr_dev(input, "class", "db-file-input svelte-12y13a");
    			add_location(input, file$i, 14, 4, 261);
    			attr_dev(i0, "class", "svelte-12y13a");
    			add_location(i0, file$i, 15, 21, 356);
    			attr_dev(p0, "class", "svelte-12y13a");
    			add_location(p0, file$i, 15, 4, 339);
    			attr_dev(div0, "class", "dropbox svelte-12y13a");
    			add_location(div0, file$i, 13, 0, 234);
    			attr_dev(i1, "class", "svelte-12y13a");
    			add_location(i1, file$i, 19, 21, 453);
    			attr_dev(p1, "class", "svelte-12y13a");
    			add_location(p1, file$i, 19, 4, 436);
    			attr_dev(div1, "class", "dropbox svelte-12y13a");
    			add_location(div1, file$i, 18, 0, 385);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, input);
    			append_dev(div0, t0);
    			append_dev(div0, p0);
    			append_dev(p0, t1);
    			append_dev(p0, i0);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p1);
    			append_dev(p1, t4);
    			append_dev(p1, i1);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "change", handleFileChange, false, false, false),
    				listen_dev(div1, "click", exportDbFile, false, false, false)
    			];
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function handleFileChange(event) {
    	
    }

    function exportDbFile() {
    	
    }

    function instance$i($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectDbFile> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SelectDbFile", $$slots, []);

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		handleFileChange,
    		exportDbFile
    	});

    	return [];
    }

    class SelectDbFile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectDbFile",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var browser = createCommonjsModule(function (module) {
    module.exports=function(t){var e={};function r(n){if(e[n])return e[n].exports;var i=e[n]={i:n,l:!1,exports:{}};return t[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n});},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0});},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)r.d(n,i,function(e){return t[e]}.bind(null,i));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=32)}([function(t,e){var r;r=function(){return this}();try{r=r||Function("return this")()||(0,eval)("this");}catch(t){"object"==typeof window&&(r=window);}t.exports=r;},function(t,e,r){var n=r(6),i=Object.keys||function(t){var e=[];for(var r in t)e.push(r);return e};t.exports=f;var o=r(5);o.inherits=r(2);var s=r(23),a=r(14);o.inherits(f,s);for(var u=i(a.prototype),c=0;c<u.length;c++){var l=u[c];f.prototype[l]||(f.prototype[l]=a.prototype[l]);}function f(t){if(!(this instanceof f))return new f(t);s.call(this,t),a.call(this,t),t&&!1===t.readable&&(this.readable=!1),t&&!1===t.writable&&(this.writable=!1),this.allowHalfOpen=!0,t&&!1===t.allowHalfOpen&&(this.allowHalfOpen=!1),this.once("end",h);}function h(){this.allowHalfOpen||this._writableState.ended||n.nextTick(p,this);}function p(t){t.end();}Object.defineProperty(f.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),Object.defineProperty(f.prototype,"destroyed",{get:function(){return void 0!==this._readableState&&void 0!==this._writableState&&this._readableState.destroyed&&this._writableState.destroyed},set:function(t){void 0!==this._readableState&&void 0!==this._writableState&&(this._readableState.destroyed=t,this._writableState.destroyed=t);}}),f.prototype._destroy=function(t,e){this.push(null),this.end(),n.nextTick(e,t);};},function(t,e){"function"==typeof Object.create?t.exports=function(t,e){t.super_=e,t.prototype=Object.create(e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}});}:t.exports=function(t,e){t.super_=e;var r=function(){};r.prototype=e.prototype,t.prototype=new r,t.prototype.constructor=t;};},function(t,e,r){(function(t){
    /*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
     * @license  MIT
     */
    var n=r(38),i=r(39),o=r(40);function s(){return u.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function a(t,e){if(s()<e)throw new RangeError("Invalid typed array length");return u.TYPED_ARRAY_SUPPORT?(t=new Uint8Array(e)).__proto__=u.prototype:(null===t&&(t=new u(e)),t.length=e),t}function u(t,e,r){if(!(u.TYPED_ARRAY_SUPPORT||this instanceof u))return new u(t,e,r);if("number"==typeof t){if("string"==typeof e)throw new Error("If encoding is specified then the first argument must be a string");return f(this,t)}return c(this,t,e,r)}function c(t,e,r,n){if("number"==typeof e)throw new TypeError('"value" argument must not be a number');return "undefined"!=typeof ArrayBuffer&&e instanceof ArrayBuffer?function(t,e,r,n){if(e.byteLength,r<0||e.byteLength<r)throw new RangeError("'offset' is out of bounds");if(e.byteLength<r+(n||0))throw new RangeError("'length' is out of bounds");return e=void 0===r&&void 0===n?new Uint8Array(e):void 0===n?new Uint8Array(e,r):new Uint8Array(e,r,n),u.TYPED_ARRAY_SUPPORT?(t=e).__proto__=u.prototype:t=h(t,e),t}(t,e,r,n):"string"==typeof e?function(t,e,r){if("string"==typeof r&&""!==r||(r="utf8"),!u.isEncoding(r))throw new TypeError('"encoding" must be a valid string encoding');var n=0|d(e,r),i=(t=a(t,n)).write(e,r);return i!==n&&(t=t.slice(0,i)),t}(t,e,r):function(t,e){if(u.isBuffer(e)){var r=0|p(e.length);return 0===(t=a(t,r)).length?t:(e.copy(t,0,0,r),t)}if(e){if("undefined"!=typeof ArrayBuffer&&e.buffer instanceof ArrayBuffer||"length"in e)return "number"!=typeof e.length||function(t){return t!=t}(e.length)?a(t,0):h(t,e);if("Buffer"===e.type&&o(e.data))return h(t,e.data)}throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}(t,e)}function l(t){if("number"!=typeof t)throw new TypeError('"size" argument must be a number');if(t<0)throw new RangeError('"size" argument must not be negative')}function f(t,e){if(l(e),t=a(t,e<0?0:0|p(e)),!u.TYPED_ARRAY_SUPPORT)for(var r=0;r<e;++r)t[r]=0;return t}function h(t,e){var r=e.length<0?0:0|p(e.length);t=a(t,r);for(var n=0;n<r;n+=1)t[n]=255&e[n];return t}function p(t){if(t>=s())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+s().toString(16)+" bytes");return 0|t}function d(t,e){if(u.isBuffer(t))return t.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(t)||t instanceof ArrayBuffer))return t.byteLength;"string"!=typeof t&&(t=""+t);var r=t.length;if(0===r)return 0;for(var n=!1;;)switch(e){case"ascii":case"latin1":case"binary":return r;case"utf8":case"utf-8":case void 0:return N(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*r;case"hex":return r>>>1;case"base64":return H(t).length;default:if(n)return N(t).length;e=(""+e).toLowerCase(),n=!0;}}function _(t,e,r){var n=t[e];t[e]=t[r],t[r]=n;}function v(t,e,r,n,i){if(0===t.length)return -1;if("string"==typeof r?(n=r,r=0):r>2147483647?r=2147483647:r<-2147483648&&(r=-2147483648),r=+r,isNaN(r)&&(r=i?0:t.length-1),r<0&&(r=t.length+r),r>=t.length){if(i)return -1;r=t.length-1;}else if(r<0){if(!i)return -1;r=0;}if("string"==typeof e&&(e=u.from(e,n)),u.isBuffer(e))return 0===e.length?-1:y(t,e,r,n,i);if("number"==typeof e)return e&=255,u.TYPED_ARRAY_SUPPORT&&"function"==typeof Uint8Array.prototype.indexOf?i?Uint8Array.prototype.indexOf.call(t,e,r):Uint8Array.prototype.lastIndexOf.call(t,e,r):y(t,[e],r,n,i);throw new TypeError("val must be string, number or Buffer")}function y(t,e,r,n,i){var o,s=1,a=t.length,u=e.length;if(void 0!==n&&("ucs2"===(n=String(n).toLowerCase())||"ucs-2"===n||"utf16le"===n||"utf-16le"===n)){if(t.length<2||e.length<2)return -1;s=2,a/=2,u/=2,r/=2;}function c(t,e){return 1===s?t[e]:t.readUInt16BE(e*s)}if(i){var l=-1;for(o=r;o<a;o++)if(c(t,o)===c(e,-1===l?0:o-l)){if(-1===l&&(l=o),o-l+1===u)return l*s}else -1!==l&&(o-=o-l),l=-1;}else for(r+u>a&&(r=a-u),o=r;o>=0;o--){for(var f=!0,h=0;h<u;h++)if(c(t,o+h)!==c(e,h)){f=!1;break}if(f)return o}return -1}function m(t,e,r,n){r=Number(r)||0;var i=t.length-r;n?(n=Number(n))>i&&(n=i):n=i;var o=e.length;if(o%2!=0)throw new TypeError("Invalid hex string");n>o/2&&(n=o/2);for(var s=0;s<n;++s){var a=parseInt(e.substr(2*s,2),16);if(isNaN(a))return s;t[r+s]=a;}return s}function g(t,e,r,n){return V(N(e,t.length-r),t,r,n)}function b(t,e,r,n){return V(function(t){for(var e=[],r=0;r<t.length;++r)e.push(255&t.charCodeAt(r));return e}(e),t,r,n)}function w(t,e,r,n){return b(t,e,r,n)}function E(t,e,r,n){return V(H(e),t,r,n)}function C(t,e,r,n){return V(function(t,e){for(var r,n,i,o=[],s=0;s<t.length&&!((e-=2)<0);++s)n=(r=t.charCodeAt(s))>>8,i=r%256,o.push(i),o.push(n);return o}(e,t.length-r),t,r,n)}function x(t,e,r){return 0===e&&r===t.length?n.fromByteArray(t):n.fromByteArray(t.slice(e,r))}function j(t,e,r){r=Math.min(t.length,r);for(var n=[],i=e;i<r;){var o,s,a,u,c=t[i],l=null,f=c>239?4:c>223?3:c>191?2:1;if(i+f<=r)switch(f){case 1:c<128&&(l=c);break;case 2:128==(192&(o=t[i+1]))&&(u=(31&c)<<6|63&o)>127&&(l=u);break;case 3:o=t[i+1],s=t[i+2],128==(192&o)&&128==(192&s)&&(u=(15&c)<<12|(63&o)<<6|63&s)>2047&&(u<55296||u>57343)&&(l=u);break;case 4:o=t[i+1],s=t[i+2],a=t[i+3],128==(192&o)&&128==(192&s)&&128==(192&a)&&(u=(15&c)<<18|(63&o)<<12|(63&s)<<6|63&a)>65535&&u<1114112&&(l=u);}null===l?(l=65533,f=1):l>65535&&(l-=65536,n.push(l>>>10&1023|55296),l=56320|1023&l),n.push(l),i+=f;}return function(t){var e=t.length;if(e<=S)return String.fromCharCode.apply(String,t);for(var r="",n=0;n<e;)r+=String.fromCharCode.apply(String,t.slice(n,n+=S));return r}(n)}e.Buffer=u,e.SlowBuffer=function(t){return +t!=t&&(t=0),u.alloc(+t)},e.INSPECT_MAX_BYTES=50,u.TYPED_ARRAY_SUPPORT=void 0!==t.TYPED_ARRAY_SUPPORT?t.TYPED_ARRAY_SUPPORT:function(){try{var t=new Uint8Array(1);return t.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===t.foo()&&"function"==typeof t.subarray&&0===t.subarray(1,1).byteLength}catch(t){return !1}}(),e.kMaxLength=s(),u.poolSize=8192,u._augment=function(t){return t.__proto__=u.prototype,t},u.from=function(t,e,r){return c(null,t,e,r)},u.TYPED_ARRAY_SUPPORT&&(u.prototype.__proto__=Uint8Array.prototype,u.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&u[Symbol.species]===u&&Object.defineProperty(u,Symbol.species,{value:null,configurable:!0})),u.alloc=function(t,e,r){return function(t,e,r,n){return l(e),e<=0?a(t,e):void 0!==r?"string"==typeof n?a(t,e).fill(r,n):a(t,e).fill(r):a(t,e)}(null,t,e,r)},u.allocUnsafe=function(t){return f(null,t)},u.allocUnsafeSlow=function(t){return f(null,t)},u.isBuffer=function(t){return !(null==t||!t._isBuffer)},u.compare=function(t,e){if(!u.isBuffer(t)||!u.isBuffer(e))throw new TypeError("Arguments must be Buffers");if(t===e)return 0;for(var r=t.length,n=e.length,i=0,o=Math.min(r,n);i<o;++i)if(t[i]!==e[i]){r=t[i],n=e[i];break}return r<n?-1:n<r?1:0},u.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return !0;default:return !1}},u.concat=function(t,e){if(!o(t))throw new TypeError('"list" argument must be an Array of Buffers');if(0===t.length)return u.alloc(0);var r;if(void 0===e)for(e=0,r=0;r<t.length;++r)e+=t[r].length;var n=u.allocUnsafe(e),i=0;for(r=0;r<t.length;++r){var s=t[r];if(!u.isBuffer(s))throw new TypeError('"list" argument must be an Array of Buffers');s.copy(n,i),i+=s.length;}return n},u.byteLength=d,u.prototype._isBuffer=!0,u.prototype.swap16=function(){var t=this.length;if(t%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var e=0;e<t;e+=2)_(this,e,e+1);return this},u.prototype.swap32=function(){var t=this.length;if(t%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var e=0;e<t;e+=4)_(this,e,e+3),_(this,e+1,e+2);return this},u.prototype.swap64=function(){var t=this.length;if(t%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var e=0;e<t;e+=8)_(this,e,e+7),_(this,e+1,e+6),_(this,e+2,e+5),_(this,e+3,e+4);return this},u.prototype.toString=function(){var t=0|this.length;return 0===t?"":0===arguments.length?j(this,0,t):function(t,e,r){var n=!1;if((void 0===e||e<0)&&(e=0),e>this.length)return "";if((void 0===r||r>this.length)&&(r=this.length),r<=0)return "";if((r>>>=0)<=(e>>>=0))return "";for(t||(t="utf8");;)switch(t){case"hex":return T(this,e,r);case"utf8":case"utf-8":return j(this,e,r);case"ascii":return R(this,e,r);case"latin1":case"binary":return k(this,e,r);case"base64":return x(this,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return P(this,e,r);default:if(n)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),n=!0;}}.apply(this,arguments)},u.prototype.equals=function(t){if(!u.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t||0===u.compare(this,t)},u.prototype.inspect=function(){var t="",r=e.INSPECT_MAX_BYTES;return this.length>0&&(t=this.toString("hex",0,r).match(/.{2}/g).join(" "),this.length>r&&(t+=" ... ")),"<Buffer "+t+">"},u.prototype.compare=function(t,e,r,n,i){if(!u.isBuffer(t))throw new TypeError("Argument must be a Buffer");if(void 0===e&&(e=0),void 0===r&&(r=t?t.length:0),void 0===n&&(n=0),void 0===i&&(i=this.length),e<0||r>t.length||n<0||i>this.length)throw new RangeError("out of range index");if(n>=i&&e>=r)return 0;if(n>=i)return -1;if(e>=r)return 1;if(e>>>=0,r>>>=0,n>>>=0,i>>>=0,this===t)return 0;for(var o=i-n,s=r-e,a=Math.min(o,s),c=this.slice(n,i),l=t.slice(e,r),f=0;f<a;++f)if(c[f]!==l[f]){o=c[f],s=l[f];break}return o<s?-1:s<o?1:0},u.prototype.includes=function(t,e,r){return -1!==this.indexOf(t,e,r)},u.prototype.indexOf=function(t,e,r){return v(this,t,e,r,!0)},u.prototype.lastIndexOf=function(t,e,r){return v(this,t,e,r,!1)},u.prototype.write=function(t,e,r,n){if(void 0===e)n="utf8",r=this.length,e=0;else if(void 0===r&&"string"==typeof e)n=e,r=this.length,e=0;else {if(!isFinite(e))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");e|=0,isFinite(r)?(r|=0,void 0===n&&(n="utf8")):(n=r,r=void 0);}var i=this.length-e;if((void 0===r||r>i)&&(r=i),t.length>0&&(r<0||e<0)||e>this.length)throw new RangeError("Attempt to write outside buffer bounds");n||(n="utf8");for(var o=!1;;)switch(n){case"hex":return m(this,t,e,r);case"utf8":case"utf-8":return g(this,t,e,r);case"ascii":return b(this,t,e,r);case"latin1":case"binary":return w(this,t,e,r);case"base64":return E(this,t,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return C(this,t,e,r);default:if(o)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),o=!0;}},u.prototype.toJSON=function(){return {type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var S=4096;function R(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;i<r;++i)n+=String.fromCharCode(127&t[i]);return n}function k(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;i<r;++i)n+=String.fromCharCode(t[i]);return n}function T(t,e,r){var n=t.length;(!e||e<0)&&(e=0),(!r||r<0||r>n)&&(r=n);for(var i="",o=e;o<r;++o)i+=U(t[o]);return i}function P(t,e,r){for(var n=t.slice(e,r),i="",o=0;o<n.length;o+=2)i+=String.fromCharCode(n[o]+256*n[o+1]);return i}function O(t,e,r){if(t%1!=0||t<0)throw new RangeError("offset is not uint");if(t+e>r)throw new RangeError("Trying to access beyond buffer length")}function A(t,e,r,n,i,o){if(!u.isBuffer(t))throw new TypeError('"buffer" argument must be a Buffer instance');if(e>i||e<o)throw new RangeError('"value" argument is out of bounds');if(r+n>t.length)throw new RangeError("Index out of range")}function F(t,e,r,n){e<0&&(e=65535+e+1);for(var i=0,o=Math.min(t.length-r,2);i<o;++i)t[r+i]=(e&255<<8*(n?i:1-i))>>>8*(n?i:1-i);}function L(t,e,r,n){e<0&&(e=4294967295+e+1);for(var i=0,o=Math.min(t.length-r,4);i<o;++i)t[r+i]=e>>>8*(n?i:3-i)&255;}function M(t,e,r,n,i,o){if(r+n>t.length)throw new RangeError("Index out of range");if(r<0)throw new RangeError("Index out of range")}function B(t,e,r,n,o){return o||M(t,0,r,4),i.write(t,e,r,n,23,4),r+4}function D(t,e,r,n,o){return o||M(t,0,r,8),i.write(t,e,r,n,52,8),r+8}u.prototype.slice=function(t,e){var r,n=this.length;if(t=~~t,e=void 0===e?n:~~e,t<0?(t+=n)<0&&(t=0):t>n&&(t=n),e<0?(e+=n)<0&&(e=0):e>n&&(e=n),e<t&&(e=t),u.TYPED_ARRAY_SUPPORT)(r=this.subarray(t,e)).__proto__=u.prototype;else {var i=e-t;r=new u(i,void 0);for(var o=0;o<i;++o)r[o]=this[o+t];}return r},u.prototype.readUIntLE=function(t,e,r){t|=0,e|=0,r||O(t,e,this.length);for(var n=this[t],i=1,o=0;++o<e&&(i*=256);)n+=this[t+o]*i;return n},u.prototype.readUIntBE=function(t,e,r){t|=0,e|=0,r||O(t,e,this.length);for(var n=this[t+--e],i=1;e>0&&(i*=256);)n+=this[t+--e]*i;return n},u.prototype.readUInt8=function(t,e){return e||O(t,1,this.length),this[t]},u.prototype.readUInt16LE=function(t,e){return e||O(t,2,this.length),this[t]|this[t+1]<<8},u.prototype.readUInt16BE=function(t,e){return e||O(t,2,this.length),this[t]<<8|this[t+1]},u.prototype.readUInt32LE=function(t,e){return e||O(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},u.prototype.readUInt32BE=function(t,e){return e||O(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},u.prototype.readIntLE=function(t,e,r){t|=0,e|=0,r||O(t,e,this.length);for(var n=this[t],i=1,o=0;++o<e&&(i*=256);)n+=this[t+o]*i;return n>=(i*=128)&&(n-=Math.pow(2,8*e)),n},u.prototype.readIntBE=function(t,e,r){t|=0,e|=0,r||O(t,e,this.length);for(var n=e,i=1,o=this[t+--n];n>0&&(i*=256);)o+=this[t+--n]*i;return o>=(i*=128)&&(o-=Math.pow(2,8*e)),o},u.prototype.readInt8=function(t,e){return e||O(t,1,this.length),128&this[t]?-1*(255-this[t]+1):this[t]},u.prototype.readInt16LE=function(t,e){e||O(t,2,this.length);var r=this[t]|this[t+1]<<8;return 32768&r?4294901760|r:r},u.prototype.readInt16BE=function(t,e){e||O(t,2,this.length);var r=this[t+1]|this[t]<<8;return 32768&r?4294901760|r:r},u.prototype.readInt32LE=function(t,e){return e||O(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},u.prototype.readInt32BE=function(t,e){return e||O(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},u.prototype.readFloatLE=function(t,e){return e||O(t,4,this.length),i.read(this,t,!0,23,4)},u.prototype.readFloatBE=function(t,e){return e||O(t,4,this.length),i.read(this,t,!1,23,4)},u.prototype.readDoubleLE=function(t,e){return e||O(t,8,this.length),i.read(this,t,!0,52,8)},u.prototype.readDoubleBE=function(t,e){return e||O(t,8,this.length),i.read(this,t,!1,52,8)},u.prototype.writeUIntLE=function(t,e,r,n){t=+t,e|=0,r|=0,n||A(this,t,e,r,Math.pow(2,8*r)-1,0);var i=1,o=0;for(this[e]=255&t;++o<r&&(i*=256);)this[e+o]=t/i&255;return e+r},u.prototype.writeUIntBE=function(t,e,r,n){t=+t,e|=0,r|=0,n||A(this,t,e,r,Math.pow(2,8*r)-1,0);var i=r-1,o=1;for(this[e+i]=255&t;--i>=0&&(o*=256);)this[e+i]=t/o&255;return e+r},u.prototype.writeUInt8=function(t,e,r){return t=+t,e|=0,r||A(this,t,e,1,255,0),u.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),this[e]=255&t,e+1},u.prototype.writeUInt16LE=function(t,e,r){return t=+t,e|=0,r||A(this,t,e,2,65535,0),u.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8):F(this,t,e,!0),e+2},u.prototype.writeUInt16BE=function(t,e,r){return t=+t,e|=0,r||A(this,t,e,2,65535,0),u.TYPED_ARRAY_SUPPORT?(this[e]=t>>>8,this[e+1]=255&t):F(this,t,e,!1),e+2},u.prototype.writeUInt32LE=function(t,e,r){return t=+t,e|=0,r||A(this,t,e,4,4294967295,0),u.TYPED_ARRAY_SUPPORT?(this[e+3]=t>>>24,this[e+2]=t>>>16,this[e+1]=t>>>8,this[e]=255&t):L(this,t,e,!0),e+4},u.prototype.writeUInt32BE=function(t,e,r){return t=+t,e|=0,r||A(this,t,e,4,4294967295,0),u.TYPED_ARRAY_SUPPORT?(this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t):L(this,t,e,!1),e+4},u.prototype.writeIntLE=function(t,e,r,n){if(t=+t,e|=0,!n){var i=Math.pow(2,8*r-1);A(this,t,e,r,i-1,-i);}var o=0,s=1,a=0;for(this[e]=255&t;++o<r&&(s*=256);)t<0&&0===a&&0!==this[e+o-1]&&(a=1),this[e+o]=(t/s>>0)-a&255;return e+r},u.prototype.writeIntBE=function(t,e,r,n){if(t=+t,e|=0,!n){var i=Math.pow(2,8*r-1);A(this,t,e,r,i-1,-i);}var o=r-1,s=1,a=0;for(this[e+o]=255&t;--o>=0&&(s*=256);)t<0&&0===a&&0!==this[e+o+1]&&(a=1),this[e+o]=(t/s>>0)-a&255;return e+r},u.prototype.writeInt8=function(t,e,r){return t=+t,e|=0,r||A(this,t,e,1,127,-128),u.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),t<0&&(t=255+t+1),this[e]=255&t,e+1},u.prototype.writeInt16LE=function(t,e,r){return t=+t,e|=0,r||A(this,t,e,2,32767,-32768),u.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8):F(this,t,e,!0),e+2},u.prototype.writeInt16BE=function(t,e,r){return t=+t,e|=0,r||A(this,t,e,2,32767,-32768),u.TYPED_ARRAY_SUPPORT?(this[e]=t>>>8,this[e+1]=255&t):F(this,t,e,!1),e+2},u.prototype.writeInt32LE=function(t,e,r){return t=+t,e|=0,r||A(this,t,e,4,2147483647,-2147483648),u.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8,this[e+2]=t>>>16,this[e+3]=t>>>24):L(this,t,e,!0),e+4},u.prototype.writeInt32BE=function(t,e,r){return t=+t,e|=0,r||A(this,t,e,4,2147483647,-2147483648),t<0&&(t=4294967295+t+1),u.TYPED_ARRAY_SUPPORT?(this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t):L(this,t,e,!1),e+4},u.prototype.writeFloatLE=function(t,e,r){return B(this,t,e,!0,r)},u.prototype.writeFloatBE=function(t,e,r){return B(this,t,e,!1,r)},u.prototype.writeDoubleLE=function(t,e,r){return D(this,t,e,!0,r)},u.prototype.writeDoubleBE=function(t,e,r){return D(this,t,e,!1,r)},u.prototype.copy=function(t,e,r,n){if(r||(r=0),n||0===n||(n=this.length),e>=t.length&&(e=t.length),e||(e=0),n>0&&n<r&&(n=r),n===r)return 0;if(0===t.length||0===this.length)return 0;if(e<0)throw new RangeError("targetStart out of bounds");if(r<0||r>=this.length)throw new RangeError("sourceStart out of bounds");if(n<0)throw new RangeError("sourceEnd out of bounds");n>this.length&&(n=this.length),t.length-e<n-r&&(n=t.length-e+r);var i,o=n-r;if(this===t&&r<e&&e<n)for(i=o-1;i>=0;--i)t[i+e]=this[i+r];else if(o<1e3||!u.TYPED_ARRAY_SUPPORT)for(i=0;i<o;++i)t[i+e]=this[i+r];else Uint8Array.prototype.set.call(t,this.subarray(r,r+o),e);return o},u.prototype.fill=function(t,e,r,n){if("string"==typeof t){if("string"==typeof e?(n=e,e=0,r=this.length):"string"==typeof r&&(n=r,r=this.length),1===t.length){var i=t.charCodeAt(0);i<256&&(t=i);}if(void 0!==n&&"string"!=typeof n)throw new TypeError("encoding must be a string");if("string"==typeof n&&!u.isEncoding(n))throw new TypeError("Unknown encoding: "+n)}else "number"==typeof t&&(t&=255);if(e<0||this.length<e||this.length<r)throw new RangeError("Out of range index");if(r<=e)return this;var o;if(e>>>=0,r=void 0===r?this.length:r>>>0,t||(t=0),"number"==typeof t)for(o=e;o<r;++o)this[o]=t;else {var s=u.isBuffer(t)?t:N(new u(t,n).toString()),a=s.length;for(o=0;o<r-e;++o)this[o+e]=s[o%a];}return this};var I=/[^+\/0-9A-Za-z-_]/g;function U(t){return t<16?"0"+t.toString(16):t.toString(16)}function N(t,e){var r;e=e||1/0;for(var n=t.length,i=null,o=[],s=0;s<n;++s){if((r=t.charCodeAt(s))>55295&&r<57344){if(!i){if(r>56319){(e-=3)>-1&&o.push(239,191,189);continue}if(s+1===n){(e-=3)>-1&&o.push(239,191,189);continue}i=r;continue}if(r<56320){(e-=3)>-1&&o.push(239,191,189),i=r;continue}r=65536+(i-55296<<10|r-56320);}else i&&(e-=3)>-1&&o.push(239,191,189);if(i=null,r<128){if((e-=1)<0)break;o.push(r);}else if(r<2048){if((e-=2)<0)break;o.push(r>>6|192,63&r|128);}else if(r<65536){if((e-=3)<0)break;o.push(r>>12|224,r>>6&63|128,63&r|128);}else {if(!(r<1114112))throw new Error("Invalid code point");if((e-=4)<0)break;o.push(r>>18|240,r>>12&63|128,r>>6&63|128,63&r|128);}}return o}function H(t){return n.toByteArray(function(t){if((t=function(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}(t).replace(I,"")).length<2)return "";for(;t.length%4!=0;)t+="=";return t}(t))}function V(t,e,r,n){for(var i=0;i<n&&!(i+r>=e.length||i>=t.length);++i)e[i+r]=t[i];return i}}).call(this,r(0));},function(t,e){var r,n,i=t.exports={};function o(){throw new Error("setTimeout has not been defined")}function s(){throw new Error("clearTimeout has not been defined")}function a(t){if(r===setTimeout)return setTimeout(t,0);if((r===o||!r)&&setTimeout)return r=setTimeout,setTimeout(t,0);try{return r(t,0)}catch(e){try{return r.call(null,t,0)}catch(e){return r.call(this,t,0)}}}!function(){try{r="function"==typeof setTimeout?setTimeout:o;}catch(t){r=o;}try{n="function"==typeof clearTimeout?clearTimeout:s;}catch(t){n=s;}}();var u,c=[],l=!1,f=-1;function h(){l&&u&&(l=!1,u.length?c=u.concat(c):f=-1,c.length&&p());}function p(){if(!l){var t=a(h);l=!0;for(var e=c.length;e;){for(u=c,c=[];++f<e;)u&&u[f].run();f=-1,e=c.length;}u=null,l=!1,function(t){if(n===clearTimeout)return clearTimeout(t);if((n===s||!n)&&clearTimeout)return n=clearTimeout,clearTimeout(t);try{n(t);}catch(e){try{return n.call(null,t)}catch(e){return n.call(this,t)}}}(t);}}function d(t,e){this.fun=t,this.array=e;}function _(){}i.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)e[r-1]=arguments[r];c.push(new d(t,e)),1!==c.length||l||a(p);},d.prototype.run=function(){this.fun.apply(null,this.array);},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=_,i.addListener=_,i.once=_,i.off=_,i.removeListener=_,i.removeAllListeners=_,i.emit=_,i.prependListener=_,i.prependOnceListener=_,i.listeners=function(t){return []},i.binding=function(t){throw new Error("process.binding is not supported")},i.cwd=function(){return "/"},i.chdir=function(t){throw new Error("process.chdir is not supported")},i.umask=function(){return 0};},function(t,e,r){(function(t){function r(t){return Object.prototype.toString.call(t)}e.isArray=function(t){return Array.isArray?Array.isArray(t):"[object Array]"===r(t)},e.isBoolean=function(t){return "boolean"==typeof t},e.isNull=function(t){return null===t},e.isNullOrUndefined=function(t){return null==t},e.isNumber=function(t){return "number"==typeof t},e.isString=function(t){return "string"==typeof t},e.isSymbol=function(t){return "symbol"==typeof t},e.isUndefined=function(t){return void 0===t},e.isRegExp=function(t){return "[object RegExp]"===r(t)},e.isObject=function(t){return "object"==typeof t&&null!==t},e.isDate=function(t){return "[object Date]"===r(t)},e.isError=function(t){return "[object Error]"===r(t)||t instanceof Error},e.isFunction=function(t){return "function"==typeof t},e.isPrimitive=function(t){return null===t||"boolean"==typeof t||"number"==typeof t||"string"==typeof t||"symbol"==typeof t||void 0===t},e.isBuffer=t.isBuffer;}).call(this,r(3).Buffer);},function(t,e,r){(function(e){!e.version||0===e.version.indexOf("v0.")||0===e.version.indexOf("v1.")&&0!==e.version.indexOf("v1.8.")?t.exports={nextTick:function(t,r,n,i){if("function"!=typeof t)throw new TypeError('"callback" argument must be a function');var o,s,a=arguments.length;switch(a){case 0:case 1:return e.nextTick(t);case 2:return e.nextTick(function(){t.call(null,r);});case 3:return e.nextTick(function(){t.call(null,r,n);});case 4:return e.nextTick(function(){t.call(null,r,n,i);});default:for(o=new Array(a-1),s=0;s<o.length;)o[s++]=arguments[s];return e.nextTick(function(){t.apply(null,o);})}}}:t.exports=e;}).call(this,r(4));},function(t,e,r){var n=r(3),i=n.Buffer;function o(t,e){for(var r in t)e[r]=t[r];}function s(t,e,r){return i(t,e,r)}i.from&&i.alloc&&i.allocUnsafe&&i.allocUnsafeSlow?t.exports=n:(o(n,e),e.Buffer=s),o(i,s),s.from=function(t,e,r){if("number"==typeof t)throw new TypeError("Argument must not be a number");return i(t,e,r)},s.alloc=function(t,e,r){if("number"!=typeof t)throw new TypeError("Argument must be a number");var n=i(t);return void 0!==e?"string"==typeof r?n.fill(e,r):n.fill(e):n.fill(0),n},s.allocUnsafe=function(t){if("number"!=typeof t)throw new TypeError("Argument must be a number");return i(t)},s.allocUnsafeSlow=function(t){if("number"!=typeof t)throw new TypeError("Argument must be a number");return n.SlowBuffer(t)};},function(t,e,r){var n=r(17)(Object,"create");t.exports=n;},function(t,e,r){var n=r(31);t.exports=function(t,e){for(var r=t.length;r--;)if(n(t[r][0],e))return r;return -1};},function(t,e,r){var n=r(96);t.exports=function(t,e){var r=t.__data__;return n(e)?r["string"==typeof e?"string":"hash"]:r.map};},function(t,e,r){(function(t){var n=void 0!==t&&t||"undefined"!=typeof self&&self||window,i=Function.prototype.apply;function o(t,e){this._id=t,this._clearFn=e;}e.setTimeout=function(){return new o(i.call(setTimeout,n,arguments),clearTimeout)},e.setInterval=function(){return new o(i.call(setInterval,n,arguments),clearInterval)},e.clearTimeout=e.clearInterval=function(t){t&&t.close();},o.prototype.unref=o.prototype.ref=function(){},o.prototype.close=function(){this._clearFn.call(n,this._id);},e.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e;},e.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1;},e._unrefActive=e.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout();},e));},r(35),e.setImmediate="undefined"!=typeof self&&self.setImmediate||void 0!==t&&t.setImmediate||this&&this.setImmediate,e.clearImmediate="undefined"!=typeof self&&self.clearImmediate||void 0!==t&&t.clearImmediate||this&&this.clearImmediate;}).call(this,r(0));},function(t,e){function r(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0;}function n(t){return "function"==typeof t}function i(t){return "object"==typeof t&&null!==t}function o(t){return void 0===t}t.exports=r,r.EventEmitter=r,r.prototype._events=void 0,r.prototype._maxListeners=void 0,r.defaultMaxListeners=10,r.prototype.setMaxListeners=function(t){if(!function(t){return "number"==typeof t}(t)||t<0||isNaN(t))throw TypeError("n must be a positive number");return this._maxListeners=t,this},r.prototype.emit=function(t){var e,r,s,a,u,c;if(this._events||(this._events={}),"error"===t&&(!this._events.error||i(this._events.error)&&!this._events.error.length)){if((e=arguments[1])instanceof Error)throw e;var l=new Error('Uncaught, unspecified "error" event. ('+e+")");throw l.context=e,l}if(o(r=this._events[t]))return !1;if(n(r))switch(arguments.length){case 1:r.call(this);break;case 2:r.call(this,arguments[1]);break;case 3:r.call(this,arguments[1],arguments[2]);break;default:a=Array.prototype.slice.call(arguments,1),r.apply(this,a);}else if(i(r))for(a=Array.prototype.slice.call(arguments,1),s=(c=r.slice()).length,u=0;u<s;u++)c[u].apply(this,a);return !0},r.prototype.addListener=function(t,e){var s;if(!n(e))throw TypeError("listener must be a function");return this._events||(this._events={}),this._events.newListener&&this.emit("newListener",t,n(e.listener)?e.listener:e),this._events[t]?i(this._events[t])?this._events[t].push(e):this._events[t]=[this._events[t],e]:this._events[t]=e,i(this._events[t])&&!this._events[t].warned&&(s=o(this._maxListeners)?r.defaultMaxListeners:this._maxListeners)&&s>0&&this._events[t].length>s&&(this._events[t].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[t].length),"function"==typeof console.trace&&console.trace()),this},r.prototype.on=r.prototype.addListener,r.prototype.once=function(t,e){if(!n(e))throw TypeError("listener must be a function");var r=!1;function i(){this.removeListener(t,i),r||(r=!0,e.apply(this,arguments));}return i.listener=e,this.on(t,i),this},r.prototype.removeListener=function(t,e){var r,o,s,a;if(!n(e))throw TypeError("listener must be a function");if(!this._events||!this._events[t])return this;if(s=(r=this._events[t]).length,o=-1,r===e||n(r.listener)&&r.listener===e)delete this._events[t],this._events.removeListener&&this.emit("removeListener",t,e);else if(i(r)){for(a=s;a-- >0;)if(r[a]===e||r[a].listener&&r[a].listener===e){o=a;break}if(o<0)return this;1===r.length?(r.length=0,delete this._events[t]):r.splice(o,1),this._events.removeListener&&this.emit("removeListener",t,e);}return this},r.prototype.removeAllListeners=function(t){var e,r;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[t]&&delete this._events[t],this;if(0===arguments.length){for(e in this._events)"removeListener"!==e&&this.removeAllListeners(e);return this.removeAllListeners("removeListener"),this._events={},this}if(n(r=this._events[t]))this.removeListener(t,r);else if(r)for(;r.length;)this.removeListener(t,r[r.length-1]);return delete this._events[t],this},r.prototype.listeners=function(t){return this._events&&this._events[t]?n(this._events[t])?[this._events[t]]:this._events[t].slice():[]},r.prototype.listenerCount=function(t){if(this._events){var e=this._events[t];if(n(e))return 1;if(e)return e.length}return 0},r.listenerCount=function(t,e){return t.listenerCount(e)};},function(t,e,r){(e=t.exports=r(23)).Stream=e,e.Readable=e,e.Writable=r(14),e.Duplex=r(1),e.Transform=r(27),e.PassThrough=r(45);},function(t,e,r){(function(e,n,i){var o=r(6);function s(t){var e=this;this.next=null,this.entry=null,this.finish=function(){!function(t,e,r){var n=t.entry;for(t.entry=null;n;){var i=n.callback;e.pendingcb--,i(void 0),n=n.next;}e.corkedRequestsFree?e.corkedRequestsFree.next=t:e.corkedRequestsFree=t;}(e,t);};}t.exports=m;var a,u=!e.browser&&["v0.10","v0.9."].indexOf(e.version.slice(0,5))>-1?n:o.nextTick;m.WritableState=y;var c=r(5);c.inherits=r(2);var l,f={deprecate:r(44)},h=r(24),p=r(7).Buffer,d=i.Uint8Array||function(){},_=r(25);function v(){}function y(t,e){a=a||r(1),t=t||{};var n=e instanceof a;this.objectMode=!!t.objectMode,n&&(this.objectMode=this.objectMode||!!t.writableObjectMode);var i=t.highWaterMark,c=t.writableHighWaterMark,l=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(c||0===c)?c:l,this.highWaterMark=Math.floor(this.highWaterMark),this.finalCalled=!1,this.needDrain=!1,this.ending=!1,this.ended=!1,this.finished=!1,this.destroyed=!1;var f=!1===t.decodeStrings;this.decodeStrings=!f,this.defaultEncoding=t.defaultEncoding||"utf8",this.length=0,this.writing=!1,this.corked=0,this.sync=!0,this.bufferProcessing=!1,this.onwrite=function(t){!function(t,e){var r=t._writableState,n=r.sync,i=r.writecb;if(function(t){t.writing=!1,t.writecb=null,t.length-=t.writelen,t.writelen=0;}(r),e)!function(t,e,r,n,i){--e.pendingcb,r?(o.nextTick(i,n),o.nextTick(x,t,e),t._writableState.errorEmitted=!0,t.emit("error",n)):(i(n),t._writableState.errorEmitted=!0,t.emit("error",n),x(t,e));}(t,r,n,e,i);else {var s=E(r);s||r.corked||r.bufferProcessing||!r.bufferedRequest||w(t,r),n?u(b,t,r,s,i):b(t,r,s,i);}}(e,t);},this.writecb=null,this.writelen=0,this.bufferedRequest=null,this.lastBufferedRequest=null,this.pendingcb=0,this.prefinished=!1,this.errorEmitted=!1,this.bufferedRequestCount=0,this.corkedRequestsFree=new s(this);}function m(t){if(a=a||r(1),!(l.call(m,this)||this instanceof a))return new m(t);this._writableState=new y(t,this),this.writable=!0,t&&("function"==typeof t.write&&(this._write=t.write),"function"==typeof t.writev&&(this._writev=t.writev),"function"==typeof t.destroy&&(this._destroy=t.destroy),"function"==typeof t.final&&(this._final=t.final)),h.call(this);}function g(t,e,r,n,i,o,s){e.writelen=n,e.writecb=s,e.writing=!0,e.sync=!0,r?t._writev(i,e.onwrite):t._write(i,o,e.onwrite),e.sync=!1;}function b(t,e,r,n){r||function(t,e){0===e.length&&e.needDrain&&(e.needDrain=!1,t.emit("drain"));}(t,e),e.pendingcb--,n(),x(t,e);}function w(t,e){e.bufferProcessing=!0;var r=e.bufferedRequest;if(t._writev&&r&&r.next){var n=e.bufferedRequestCount,i=new Array(n),o=e.corkedRequestsFree;o.entry=r;for(var a=0,u=!0;r;)i[a]=r,r.isBuf||(u=!1),r=r.next,a+=1;i.allBuffers=u,g(t,e,!0,e.length,i,"",o.finish),e.pendingcb++,e.lastBufferedRequest=null,o.next?(e.corkedRequestsFree=o.next,o.next=null):e.corkedRequestsFree=new s(e),e.bufferedRequestCount=0;}else {for(;r;){var c=r.chunk,l=r.encoding,f=r.callback;if(g(t,e,!1,e.objectMode?1:c.length,c,l,f),r=r.next,e.bufferedRequestCount--,e.writing)break}null===r&&(e.lastBufferedRequest=null);}e.bufferedRequest=r,e.bufferProcessing=!1;}function E(t){return t.ending&&0===t.length&&null===t.bufferedRequest&&!t.finished&&!t.writing}function C(t,e){t._final(function(r){e.pendingcb--,r&&t.emit("error",r),e.prefinished=!0,t.emit("prefinish"),x(t,e);});}function x(t,e){var r=E(e);return r&&(function(t,e){e.prefinished||e.finalCalled||("function"==typeof t._final?(e.pendingcb++,e.finalCalled=!0,o.nextTick(C,t,e)):(e.prefinished=!0,t.emit("prefinish")));}(t,e),0===e.pendingcb&&(e.finished=!0,t.emit("finish"))),r}c.inherits(m,h),y.prototype.getBuffer=function(){for(var t=this.bufferedRequest,e=[];t;)e.push(t),t=t.next;return e},function(){try{Object.defineProperty(y.prototype,"buffer",{get:f.deprecate(function(){return this.getBuffer()},"_writableState.buffer is deprecated. Use _writableState.getBuffer instead.","DEP0003")});}catch(t){}}(),"function"==typeof Symbol&&Symbol.hasInstance&&"function"==typeof Function.prototype[Symbol.hasInstance]?(l=Function.prototype[Symbol.hasInstance],Object.defineProperty(m,Symbol.hasInstance,{value:function(t){return !!l.call(this,t)||this===m&&t&&t._writableState instanceof y}})):l=function(t){return t instanceof this},m.prototype.pipe=function(){this.emit("error",new Error("Cannot pipe, not readable"));},m.prototype.write=function(t,e,r){var n=this._writableState,i=!1,s=!n.objectMode&&function(t){return p.isBuffer(t)||t instanceof d}(t);return s&&!p.isBuffer(t)&&(t=function(t){return p.from(t)}(t)),"function"==typeof e&&(r=e,e=null),s?e="buffer":e||(e=n.defaultEncoding),"function"!=typeof r&&(r=v),n.ended?function(t,e){var r=new Error("write after end");t.emit("error",r),o.nextTick(e,r);}(this,r):(s||function(t,e,r,n){var i=!0,s=!1;return null===r?s=new TypeError("May not write null values to stream"):"string"==typeof r||void 0===r||e.objectMode||(s=new TypeError("Invalid non-string/buffer chunk")),s&&(t.emit("error",s),o.nextTick(n,s),i=!1),i}(this,n,t,r))&&(n.pendingcb++,i=function(t,e,r,n,i,o){if(!r){var s=function(t,e,r){return t.objectMode||!1===t.decodeStrings||"string"!=typeof e||(e=p.from(e,r)),e}(e,n,i);n!==s&&(r=!0,i="buffer",n=s);}var a=e.objectMode?1:n.length;e.length+=a;var u=e.length<e.highWaterMark;if(u||(e.needDrain=!0),e.writing||e.corked){var c=e.lastBufferedRequest;e.lastBufferedRequest={chunk:n,encoding:i,isBuf:r,callback:o,next:null},c?c.next=e.lastBufferedRequest:e.bufferedRequest=e.lastBufferedRequest,e.bufferedRequestCount+=1;}else g(t,e,!1,a,n,i,o);return u}(this,n,s,t,e,r)),i},m.prototype.cork=function(){this._writableState.corked++;},m.prototype.uncork=function(){var t=this._writableState;t.corked&&(t.corked--,t.writing||t.corked||t.finished||t.bufferProcessing||!t.bufferedRequest||w(this,t));},m.prototype.setDefaultEncoding=function(t){if("string"==typeof t&&(t=t.toLowerCase()),!(["hex","utf8","utf-8","ascii","binary","base64","ucs2","ucs-2","utf16le","utf-16le","raw"].indexOf((t+"").toLowerCase())>-1))throw new TypeError("Unknown encoding: "+t);return this._writableState.defaultEncoding=t,this},Object.defineProperty(m.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),m.prototype._write=function(t,e,r){r(new Error("_write() is not implemented"));},m.prototype._writev=null,m.prototype.end=function(t,e,r){var n=this._writableState;"function"==typeof t?(r=t,t=null,e=null):"function"==typeof e&&(r=e,e=null),null!==t&&void 0!==t&&this.write(t,e),n.corked&&(n.corked=1,this.uncork()),n.ending||n.finished||function(t,e,r){e.ending=!0,x(t,e),r&&(e.finished?o.nextTick(r):t.once("finish",r)),e.ended=!0,t.writable=!1;}(this,n,r);},Object.defineProperty(m.prototype,"destroyed",{get:function(){return void 0!==this._writableState&&this._writableState.destroyed},set:function(t){this._writableState&&(this._writableState.destroyed=t);}}),m.prototype.destroy=_.destroy,m.prototype._undestroy=_.undestroy,m.prototype._destroy=function(t,e){this.end(),e(t);};}).call(this,r(4),r(11).setImmediate,r(0));},function(t,e,r){(function(e,r,n){t.exports=function t(e,r,n){function i(s,a){if(!r[s]){if(!e[s]){var u="function"==typeof _dereq_&&_dereq_;if(!a&&u)return u(s,!0);if(o)return o(s,!0);var c=new Error("Cannot find module '"+s+"'");throw c.code="MODULE_NOT_FOUND",c}var l=r[s]={exports:{}};e[s][0].call(l.exports,function(t){return i(e[s][1][t]||t)},l,l.exports,t,e,r,n);}return r[s].exports}for(var o="function"==typeof _dereq_&&_dereq_,s=0;s<n.length;s++)i(n[s]);return i}({1:[function(t,e,r){e.exports=function(t){var e=t._SomePromiseArray;function r(t){var r=new e(t),n=r.promise();return r.setHowMany(1),r.setUnwrap(),r.init(),n}t.any=function(t){return r(t)},t.prototype.any=function(){return r(this)};};},{}],2:[function(t,r,n){var i;try{throw new Error}catch(t){i=t;}var o=t("./schedule"),s=t("./queue"),a=t("./util");function u(){this._customScheduler=!1,this._isTickUsed=!1,this._lateQueue=new s(16),this._normalQueue=new s(16),this._haveDrainedQueues=!1,this._trampolineEnabled=!0;var t=this;this.drainQueues=function(){t._drainQueues();},this._schedule=o;}function c(t,e,r){this._lateQueue.push(t,e,r),this._queueTick();}function l(t,e,r){this._normalQueue.push(t,e,r),this._queueTick();}function f(t){this._normalQueue._pushOne(t),this._queueTick();}u.prototype.setScheduler=function(t){var e=this._schedule;return this._schedule=t,this._customScheduler=!0,e},u.prototype.hasCustomScheduler=function(){return this._customScheduler},u.prototype.enableTrampoline=function(){this._trampolineEnabled=!0;},u.prototype.disableTrampolineIfNecessary=function(){a.hasDevTools&&(this._trampolineEnabled=!1);},u.prototype.haveItemsQueued=function(){return this._isTickUsed||this._haveDrainedQueues},u.prototype.fatalError=function(t,r){r?(e.stderr.write("Fatal "+(t instanceof Error?t.stack:t)+"\n"),e.exit(2)):this.throwLater(t);},u.prototype.throwLater=function(t,e){if(1===arguments.length&&(e=t,t=function(){throw e}),"undefined"!=typeof setTimeout)setTimeout(function(){t(e);},0);else try{this._schedule(function(){t(e);});}catch(t){throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n")}},a.hasDevTools?(u.prototype.invokeLater=function(t,e,r){this._trampolineEnabled?c.call(this,t,e,r):this._schedule(function(){setTimeout(function(){t.call(e,r);},100);});},u.prototype.invoke=function(t,e,r){this._trampolineEnabled?l.call(this,t,e,r):this._schedule(function(){t.call(e,r);});},u.prototype.settlePromises=function(t){this._trampolineEnabled?f.call(this,t):this._schedule(function(){t._settlePromises();});}):(u.prototype.invokeLater=c,u.prototype.invoke=l,u.prototype.settlePromises=f),u.prototype._drainQueue=function(t){for(;t.length()>0;){var e=t.shift();if("function"==typeof e){var r=t.shift(),n=t.shift();e.call(r,n);}else e._settlePromises();}},u.prototype._drainQueues=function(){this._drainQueue(this._normalQueue),this._reset(),this._haveDrainedQueues=!0,this._drainQueue(this._lateQueue);},u.prototype._queueTick=function(){this._isTickUsed||(this._isTickUsed=!0,this._schedule(this.drainQueues));},u.prototype._reset=function(){this._isTickUsed=!1;},r.exports=u,r.exports.firstLineError=i;},{"./queue":26,"./schedule":29,"./util":36}],3:[function(t,e,r){e.exports=function(t,e,r,n){var i=!1,o=function(t,e){this._reject(e);},s=function(t,e){e.promiseRejectionQueued=!0,e.bindingPromise._then(o,o,null,this,t);},a=function(t,e){0==(50397184&this._bitField)&&this._resolveCallback(e.target);},u=function(t,e){e.promiseRejectionQueued||this._reject(t);};t.prototype.bind=function(o){i||(i=!0,t.prototype._propagateFrom=n.propagateFromFunction(),t.prototype._boundValue=n.boundValueFunction());var c=r(o),l=new t(e);l._propagateFrom(this,1);var f=this._target();if(l._setBoundTo(c),c instanceof t){var h={promiseRejectionQueued:!1,promise:l,target:f,bindingPromise:c};f._then(e,s,void 0,l,h),c._then(a,u,void 0,l,h),l._setOnCancel(c);}else l._resolveCallback(f);return l},t.prototype._setBoundTo=function(t){void 0!==t?(this._bitField=2097152|this._bitField,this._boundTo=t):this._bitField=-2097153&this._bitField;},t.prototype._isBound=function(){return 2097152==(2097152&this._bitField)},t.bind=function(e,r){return t.resolve(r).bind(e)};};},{}],4:[function(t,e,r){var n;"undefined"!=typeof Promise&&(n=Promise);var i=t("./promise")();i.noConflict=function(){try{Promise===i&&(Promise=n);}catch(t){}return i},e.exports=i;},{"./promise":22}],5:[function(t,e,r){var n=Object.create;if(n){var i=n(null),o=n(null);i[" size"]=o[" size"]=0;}e.exports=function(e){var r=t("./util"),n=r.canEvaluate;function i(t){return function(t,n){var i;if(null!=t&&(i=t[n]),"function"!=typeof i){var o="Object "+r.classString(t)+" has no method '"+r.toString(n)+"'";throw new e.TypeError(o)}return i}(t,this.pop()).apply(t,this)}function o(t){return t[this]}function s(t){var e=+this;return e<0&&(e=Math.max(0,e+t.length)),t[e]}r.isIdentifier,e.prototype.call=function(t){var e=[].slice.call(arguments,1);return e.push(t),this._then(i,void 0,void 0,e,void 0)},e.prototype.get=function(t){var e;if("number"==typeof t)e=s;else if(n){var r=(void 0)(t);e=null!==r?r:o;}else e=o;return this._then(e,void 0,void 0,t,void 0)};};},{"./util":36}],6:[function(t,e,r){e.exports=function(e,r,n,i){var o=t("./util"),s=o.tryCatch,a=o.errorObj,u=e._async;e.prototype.break=e.prototype.cancel=function(){if(!i.cancellation())return this._warn("cancellation is disabled");for(var t=this,e=t;t._isCancellable();){if(!t._cancelBy(e)){e._isFollowing()?e._followee().cancel():e._cancelBranched();break}var r=t._cancellationParent;if(null==r||!r._isCancellable()){t._isFollowing()?t._followee().cancel():t._cancelBranched();break}t._isFollowing()&&t._followee().cancel(),t._setWillBeCancelled(),e=t,t=r;}},e.prototype._branchHasCancelled=function(){this._branchesRemainingToCancel--;},e.prototype._enoughBranchesHaveCancelled=function(){return void 0===this._branchesRemainingToCancel||this._branchesRemainingToCancel<=0},e.prototype._cancelBy=function(t){return t===this?(this._branchesRemainingToCancel=0,this._invokeOnCancel(),!0):(this._branchHasCancelled(),!!this._enoughBranchesHaveCancelled()&&(this._invokeOnCancel(),!0))},e.prototype._cancelBranched=function(){this._enoughBranchesHaveCancelled()&&this._cancel();},e.prototype._cancel=function(){this._isCancellable()&&(this._setCancelled(),u.invoke(this._cancelPromises,this,void 0));},e.prototype._cancelPromises=function(){this._length()>0&&this._settlePromises();},e.prototype._unsetOnCancel=function(){this._onCancelField=void 0;},e.prototype._isCancellable=function(){return this.isPending()&&!this._isCancelled()},e.prototype.isCancellable=function(){return this.isPending()&&!this.isCancelled()},e.prototype._doInvokeOnCancel=function(t,e){if(o.isArray(t))for(var r=0;r<t.length;++r)this._doInvokeOnCancel(t[r],e);else if(void 0!==t)if("function"==typeof t){if(!e){var n=s(t).call(this._boundValue());n===a&&(this._attachExtraTrace(n.e),u.throwLater(n.e));}}else t._resultCancelled(this);},e.prototype._invokeOnCancel=function(){var t=this._onCancel();this._unsetOnCancel(),u.invoke(this._doInvokeOnCancel,this,t);},e.prototype._invokeInternalOnCancel=function(){this._isCancellable()&&(this._doInvokeOnCancel(this._onCancel(),!0),this._unsetOnCancel());},e.prototype._resultCancelled=function(){this.cancel();};};},{"./util":36}],7:[function(t,e,r){e.exports=function(e){var r=t("./util"),n=t("./es5").keys,i=r.tryCatch,o=r.errorObj;return function(t,s,a){return function(u){var c=a._boundValue();t:for(var l=0;l<t.length;++l){var f=t[l];if(f===Error||null!=f&&f.prototype instanceof Error){if(u instanceof f)return i(s).call(c,u)}else if("function"==typeof f){var h=i(f).call(c,u);if(h===o)return h;if(h)return i(s).call(c,u)}else if(r.isObject(u)){for(var p=n(f),d=0;d<p.length;++d){var _=p[d];if(f[_]!=u[_])continue t}return i(s).call(c,u)}}return e}}};},{"./es5":13,"./util":36}],8:[function(t,e,r){e.exports=function(t){var e=!1,r=[];function n(){this._trace=new n.CapturedTrace(i());}function i(){var t=r.length-1;if(t>=0)return r[t]}return t.prototype._promiseCreated=function(){},t.prototype._pushContext=function(){},t.prototype._popContext=function(){return null},t._peekContext=t.prototype._peekContext=function(){},n.prototype._pushContext=function(){void 0!==this._trace&&(this._trace._promiseCreated=null,r.push(this._trace));},n.prototype._popContext=function(){if(void 0!==this._trace){var t=r.pop(),e=t._promiseCreated;return t._promiseCreated=null,e}return null},n.CapturedTrace=null,n.create=function(){if(e)return new n},n.deactivateLongStackTraces=function(){},n.activateLongStackTraces=function(){var r=t.prototype._pushContext,o=t.prototype._popContext,s=t._peekContext,a=t.prototype._peekContext,u=t.prototype._promiseCreated;n.deactivateLongStackTraces=function(){t.prototype._pushContext=r,t.prototype._popContext=o,t._peekContext=s,t.prototype._peekContext=a,t.prototype._promiseCreated=u,e=!1;},e=!0,t.prototype._pushContext=n.prototype._pushContext,t.prototype._popContext=n.prototype._popContext,t._peekContext=t.prototype._peekContext=i,t.prototype._promiseCreated=function(){var t=this._peekContext();t&&null==t._promiseCreated&&(t._promiseCreated=this);};},n};},{}],9:[function(t,r,n){r.exports=function(r,n){var i,o,s,a=r._getDomain,u=r._async,c=t("./errors").Warning,l=t("./util"),f=l.canAttachTrace,h=/[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/,p=/\((?:timers\.js):\d+:\d+\)/,d=/[\/<\(](.+?):(\d+):(\d+)\)?\s*$/,_=null,v=null,y=!1,m=!(0==l.env("BLUEBIRD_DEBUG")),g=!(0==l.env("BLUEBIRD_WARNINGS")||!m&&!l.env("BLUEBIRD_WARNINGS")),b=!(0==l.env("BLUEBIRD_LONG_STACK_TRACES")||!m&&!l.env("BLUEBIRD_LONG_STACK_TRACES")),w=0!=l.env("BLUEBIRD_W_FORGOTTEN_RETURN")&&(g||!!l.env("BLUEBIRD_W_FORGOTTEN_RETURN"));r.prototype.suppressUnhandledRejections=function(){var t=this._target();t._bitField=-1048577&t._bitField|524288;},r.prototype._ensurePossibleRejectionHandled=function(){if(0==(524288&this._bitField)){this._setRejectionIsUnhandled();var t=this;setTimeout(function(){t._notifyUnhandledRejection();},1);}},r.prototype._notifyUnhandledRejectionIsHandled=function(){q("rejectionHandled",i,void 0,this);},r.prototype._setReturnedNonUndefined=function(){this._bitField=268435456|this._bitField;},r.prototype._returnedNonUndefined=function(){return 0!=(268435456&this._bitField)},r.prototype._notifyUnhandledRejection=function(){if(this._isRejectionUnhandled()){var t=this._settledValue();this._setUnhandledRejectionIsNotified(),q("unhandledRejection",o,t,this);}},r.prototype._setUnhandledRejectionIsNotified=function(){this._bitField=262144|this._bitField;},r.prototype._unsetUnhandledRejectionIsNotified=function(){this._bitField=-262145&this._bitField;},r.prototype._isUnhandledRejectionNotified=function(){return (262144&this._bitField)>0},r.prototype._setRejectionIsUnhandled=function(){this._bitField=1048576|this._bitField;},r.prototype._unsetRejectionIsUnhandled=function(){this._bitField=-1048577&this._bitField,this._isUnhandledRejectionNotified()&&(this._unsetUnhandledRejectionIsNotified(),this._notifyUnhandledRejectionIsHandled());},r.prototype._isRejectionUnhandled=function(){return (1048576&this._bitField)>0},r.prototype._warn=function(t,e,r){return U(t,e,r||this)},r.onPossiblyUnhandledRejection=function(t){var e=a();o="function"==typeof t?null===e?t:l.domainBind(e,t):void 0;},r.onUnhandledRejectionHandled=function(t){var e=a();i="function"==typeof t?null===e?t:l.domainBind(e,t):void 0;};var E=function(){};r.longStackTraces=function(){if(u.haveItemsQueued()&&!J.longStackTraces)throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");if(!J.longStackTraces&&Y()){var t=r.prototype._captureStackTrace,e=r.prototype._attachExtraTrace;J.longStackTraces=!0,E=function(){if(u.haveItemsQueued()&&!J.longStackTraces)throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");r.prototype._captureStackTrace=t,r.prototype._attachExtraTrace=e,n.deactivateLongStackTraces(),u.enableTrampoline(),J.longStackTraces=!1;},r.prototype._captureStackTrace=D,r.prototype._attachExtraTrace=I,n.activateLongStackTraces(),u.disableTrampolineIfNecessary();}},r.hasLongStackTraces=function(){return J.longStackTraces&&Y()};var C=function(){try{if("function"==typeof CustomEvent){var t=new CustomEvent("CustomEvent");return l.global.dispatchEvent(t),function(t,e){var r=new CustomEvent(t.toLowerCase(),{detail:e,cancelable:!0});return !l.global.dispatchEvent(r)}}return "function"==typeof Event?(t=new Event("CustomEvent"),l.global.dispatchEvent(t),function(t,e){var r=new Event(t.toLowerCase(),{cancelable:!0});return r.detail=e,!l.global.dispatchEvent(r)}):((t=document.createEvent("CustomEvent")).initCustomEvent("testingtheevent",!1,!0,{}),l.global.dispatchEvent(t),function(t,e){var r=document.createEvent("CustomEvent");return r.initCustomEvent(t.toLowerCase(),!1,!0,e),!l.global.dispatchEvent(r)})}catch(t){}return function(){return !1}}(),x=l.isNode?function(){return e.emit.apply(e,arguments)}:l.global?function(t){var e="on"+t.toLowerCase(),r=l.global[e];return !!r&&(r.apply(l.global,[].slice.call(arguments,1)),!0)}:function(){return !1};function j(t,e){return {promise:e}}var S={promiseCreated:j,promiseFulfilled:j,promiseRejected:j,promiseResolved:j,promiseCancelled:j,promiseChained:function(t,e,r){return {promise:e,child:r}},warning:function(t,e){return {warning:e}},unhandledRejection:function(t,e,r){return {reason:e,promise:r}},rejectionHandled:j},R=function(t){var e=!1;try{e=x.apply(null,arguments);}catch(t){u.throwLater(t),e=!0;}var r=!1;try{r=C(t,S[t].apply(null,arguments));}catch(t){u.throwLater(t),r=!0;}return r||e};function k(){return !1}function T(t,e,r){var n=this;try{t(e,r,function(t){if("function"!=typeof t)throw new TypeError("onCancel must be a function, got: "+l.toString(t));n._attachCancellationCallback(t);});}catch(t){return t}}function P(t){if(!this._isCancellable())return this;var e=this._onCancel();void 0!==e?l.isArray(e)?e.push(t):this._setOnCancel([e,t]):this._setOnCancel(t);}function O(){return this._onCancelField}function A(t){this._onCancelField=t;}function F(){this._cancellationParent=void 0,this._onCancelField=void 0;}function L(t,e){if(0!=(1&e)){this._cancellationParent=t;var r=t._branchesRemainingToCancel;void 0===r&&(r=0),t._branchesRemainingToCancel=r+1;}0!=(2&e)&&t._isBound()&&this._setBoundTo(t._boundTo);}r.config=function(t){if("longStackTraces"in(t=Object(t))&&(t.longStackTraces?r.longStackTraces():!t.longStackTraces&&r.hasLongStackTraces()&&E()),"warnings"in t){var e=t.warnings;J.warnings=!!e,w=J.warnings,l.isObject(e)&&"wForgottenReturn"in e&&(w=!!e.wForgottenReturn);}if("cancellation"in t&&t.cancellation&&!J.cancellation){if(u.haveItemsQueued())throw new Error("cannot enable cancellation after promises are in use");r.prototype._clearCancellationData=F,r.prototype._propagateFrom=L,r.prototype._onCancel=O,r.prototype._setOnCancel=A,r.prototype._attachCancellationCallback=P,r.prototype._execute=T,M=L,J.cancellation=!0;}return "monitoring"in t&&(t.monitoring&&!J.monitoring?(J.monitoring=!0,r.prototype._fireEvent=R):!t.monitoring&&J.monitoring&&(J.monitoring=!1,r.prototype._fireEvent=k)),r},r.prototype._fireEvent=k,r.prototype._execute=function(t,e,r){try{t(e,r);}catch(t){return t}},r.prototype._onCancel=function(){},r.prototype._setOnCancel=function(t){},r.prototype._attachCancellationCallback=function(t){},r.prototype._captureStackTrace=function(){},r.prototype._attachExtraTrace=function(){},r.prototype._clearCancellationData=function(){},r.prototype._propagateFrom=function(t,e){};var M=function(t,e){0!=(2&e)&&t._isBound()&&this._setBoundTo(t._boundTo);};function B(){var t=this._boundTo;return void 0!==t&&t instanceof r?t.isFulfilled()?t.value():void 0:t}function D(){this._trace=new X(this._peekContext());}function I(t,e){if(f(t)){var r=this._trace;if(void 0!==r&&e&&(r=r._parent),void 0!==r)r.attachExtraTrace(t);else if(!t.__stackCleaned__){var n=H(t);l.notEnumerableProp(t,"stack",n.message+"\n"+n.stack.join("\n")),l.notEnumerableProp(t,"__stackCleaned__",!0);}}}function U(t,e,n){if(J.warnings){var i,o=new c(t);if(e)n._attachExtraTrace(o);else if(J.longStackTraces&&(i=r._peekContext()))i.attachExtraTrace(o);else {var s=H(o);o.stack=s.message+"\n"+s.stack.join("\n");}R("warning",o)||V(o,"",!0);}}function N(t){for(var e=[],r=0;r<t.length;++r){var n=t[r],i="    (No stack trace)"===n||_.test(n),o=i&&$(n);i&&!o&&(y&&" "!==n.charAt(0)&&(n="    "+n),e.push(n));}return e}function H(t){var e=t.stack,r=t.toString();return e="string"==typeof e&&e.length>0?function(t){for(var e=t.stack.replace(/\s+$/g,"").split("\n"),r=0;r<e.length;++r){var n=e[r];if("    (No stack trace)"===n||_.test(n))break}return r>0&&"SyntaxError"!=t.name&&(e=e.slice(r)),e}(t):["    (No stack trace)"],{message:r,stack:"SyntaxError"==t.name?e:N(e)}}function V(t,e,r){if("undefined"!=typeof console){var n;if(l.isObject(t)){var i=t.stack;n=e+v(i,t);}else n=e+String(t);"function"==typeof s?s(n,r):"function"!=typeof console.log&&"object"!=typeof console.log||console.log(n);}}function q(t,e,r,n){var i=!1;try{"function"==typeof e&&(i=!0,"rejectionHandled"===t?e(n):e(r,n));}catch(t){u.throwLater(t);}"unhandledRejection"===t?R(t,r,n)||i||V(r,"Unhandled rejection "):R(t,n);}function W(t){var e;if("function"==typeof t)e="[function "+(t.name||"anonymous")+"]";else {if(e=t&&"function"==typeof t.toString?t.toString():l.toString(t),/\[object [a-zA-Z0-9$_]+\]/.test(e))try{e=JSON.stringify(t);}catch(t){}0===e.length&&(e="(empty array)");}return "(<"+function(t){return t.length<41?t:t.substr(0,38)+"..."}(e)+">, no stack trace)"}function Y(){return "function"==typeof G}var $=function(){return !1},z=/[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;function Q(t){var e=t.match(z);if(e)return {fileName:e[1],line:parseInt(e[2],10)}}function X(t){this._parent=t,this._promisesCreated=0;var e=this._length=1+(void 0===t?0:t._length);G(this,X),e>32&&this.uncycle();}l.inherits(X,Error),n.CapturedTrace=X,X.prototype.uncycle=function(){var t=this._length;if(!(t<2)){for(var e=[],r={},n=0,i=this;void 0!==i;++n)e.push(i),i=i._parent;for(n=(t=this._length=n)-1;n>=0;--n){var o=e[n].stack;void 0===r[o]&&(r[o]=n);}for(n=0;n<t;++n){var s=r[e[n].stack];if(void 0!==s&&s!==n){s>0&&(e[s-1]._parent=void 0,e[s-1]._length=1),e[n]._parent=void 0,e[n]._length=1;var a=n>0?e[n-1]:this;s<t-1?(a._parent=e[s+1],a._parent.uncycle(),a._length=a._parent._length+1):(a._parent=void 0,a._length=1);for(var u=a._length+1,c=n-2;c>=0;--c)e[c]._length=u,u++;return}}}},X.prototype.attachExtraTrace=function(t){if(!t.__stackCleaned__){this.uncycle();for(var e=H(t),r=e.message,n=[e.stack],i=this;void 0!==i;)n.push(N(i.stack.split("\n"))),i=i._parent;!function(t){for(var e=t[0],r=1;r<t.length;++r){for(var n=t[r],i=e.length-1,o=e[i],s=-1,a=n.length-1;a>=0;--a)if(n[a]===o){s=a;break}for(a=s;a>=0;--a){var u=n[a];if(e[i]!==u)break;e.pop(),i--;}e=n;}}(n),function(t){for(var e=0;e<t.length;++e)(0===t[e].length||e+1<t.length&&t[e][0]===t[e+1][0])&&(t.splice(e,1),e--);}(n),l.notEnumerableProp(t,"stack",function(t,e){for(var r=0;r<e.length-1;++r)e[r].push("From previous event:"),e[r]=e[r].join("\n");return r<e.length&&(e[r]=e[r].join("\n")),t+"\n"+e.join("\n")}(r,n)),l.notEnumerableProp(t,"__stackCleaned__",!0);}};var G=function(){var t=/^\s*at\s*/,e=function(t,e){return "string"==typeof t?t:void 0!==e.name&&void 0!==e.message?e.toString():W(e)};if("number"==typeof Error.stackTraceLimit&&"function"==typeof Error.captureStackTrace){Error.stackTraceLimit+=6,_=t,v=e;var r=Error.captureStackTrace;return $=function(t){return h.test(t)},function(t,e){Error.stackTraceLimit+=6,r(t,e),Error.stackTraceLimit-=6;}}var n,i=new Error;if("string"==typeof i.stack&&i.stack.split("\n")[0].indexOf("stackDetection@")>=0)return _=/@/,v=e,y=!0,function(t){t.stack=(new Error).stack;};try{throw new Error}catch(t){n="stack"in t;}return "stack"in i||!n||"number"!=typeof Error.stackTraceLimit?(v=function(t,e){return "string"==typeof t?t:"object"!=typeof e&&"function"!=typeof e||void 0===e.name||void 0===e.message?W(e):e.toString()},null):(_=t,v=e,function(t){Error.stackTraceLimit+=6;try{throw new Error}catch(e){t.stack=e.stack;}Error.stackTraceLimit-=6;})}();"undefined"!=typeof console&&void 0!==console.warn&&(s=function(t){console.warn(t);},l.isNode&&e.stderr.isTTY?s=function(t,e){var r=e?"[33m":"[31m";console.warn(r+t+"[0m\n");}:l.isNode||"string"!=typeof(new Error).stack||(s=function(t,e){console.warn("%c"+t,e?"color: darkorange":"color: red");}));var J={warnings:g,longStackTraces:!1,cancellation:!1,monitoring:!1};return b&&r.longStackTraces(),{longStackTraces:function(){return J.longStackTraces},warnings:function(){return J.warnings},cancellation:function(){return J.cancellation},monitoring:function(){return J.monitoring},propagateFromFunction:function(){return M},boundValueFunction:function(){return B},checkForgottenReturns:function(t,e,r,n,i){if(void 0===t&&null!==e&&w){if(void 0!==i&&i._returnedNonUndefined())return;if(0==(65535&n._bitField))return;r&&(r+=" ");var o="",s="";if(e._trace){for(var a=e._trace.stack.split("\n"),u=N(a),c=u.length-1;c>=0;--c){var l=u[c];if(!p.test(l)){var f=l.match(d);f&&(o="at "+f[1]+":"+f[2]+":"+f[3]+" ");break}}if(u.length>0){var h=u[0];for(c=0;c<a.length;++c)if(a[c]===h){c>0&&(s="\n"+a[c-1]);break}}}var _="a promise was created in a "+r+"handler "+o+"but was not returned from it, see http://goo.gl/rRqMUw"+s;n._warn(_,!0,e);}},setBounds:function(t,e){if(Y()){for(var r,n,i=t.stack.split("\n"),o=e.stack.split("\n"),s=-1,a=-1,u=0;u<i.length;++u)if(c=Q(i[u])){r=c.fileName,s=c.line;break}for(u=0;u<o.length;++u){var c;if(c=Q(o[u])){n=c.fileName,a=c.line;break}}s<0||a<0||!r||!n||r!==n||s>=a||($=function(t){if(h.test(t))return !0;var e=Q(t);return !!(e&&e.fileName===r&&s<=e.line&&e.line<=a)});}},warn:U,deprecated:function(t,e){var r=t+" is deprecated and will be removed in a future version.";return e&&(r+=" Use "+e+" instead."),U(r)},CapturedTrace:X,fireDomEvent:C,fireGlobalEvent:x}};},{"./errors":12,"./util":36}],10:[function(t,e,r){e.exports=function(t){function e(){return this.value}function r(){throw this.reason}t.prototype.return=t.prototype.thenReturn=function(r){return r instanceof t&&r.suppressUnhandledRejections(),this._then(e,void 0,void 0,{value:r},void 0)},t.prototype.throw=t.prototype.thenThrow=function(t){return this._then(r,void 0,void 0,{reason:t},void 0)},t.prototype.catchThrow=function(t){if(arguments.length<=1)return this._then(void 0,r,void 0,{reason:t},void 0);var e=arguments[1];return this.caught(t,function(){throw e})},t.prototype.catchReturn=function(r){if(arguments.length<=1)return r instanceof t&&r.suppressUnhandledRejections(),this._then(void 0,e,void 0,{value:r},void 0);var n=arguments[1];return n instanceof t&&n.suppressUnhandledRejections(),this.caught(r,function(){return n})};};},{}],11:[function(t,e,r){e.exports=function(t,e){var r=t.reduce,n=t.all;function i(){return n(this)}t.prototype.each=function(t){return r(this,t,e,0)._then(i,void 0,void 0,this,void 0)},t.prototype.mapSeries=function(t){return r(this,t,e,e)},t.each=function(t,n){return r(t,n,e,0)._then(i,void 0,void 0,t,void 0)},t.mapSeries=function(t,n){return r(t,n,e,e)};};},{}],12:[function(t,e,r){var n,i,o=t("./es5"),s=o.freeze,a=t("./util"),u=a.inherits,c=a.notEnumerableProp;function l(t,e){function r(n){if(!(this instanceof r))return new r(n);c(this,"message","string"==typeof n?n:e),c(this,"name",t),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):Error.call(this);}return u(r,Error),r}var f=l("Warning","warning"),h=l("CancellationError","cancellation error"),p=l("TimeoutError","timeout error"),d=l("AggregateError","aggregate error");try{n=TypeError,i=RangeError;}catch(t){n=l("TypeError","type error"),i=l("RangeError","range error");}for(var _="join pop push shift unshift slice filter forEach some every map indexOf lastIndexOf reduce reduceRight sort reverse".split(" "),v=0;v<_.length;++v)"function"==typeof Array.prototype[_[v]]&&(d.prototype[_[v]]=Array.prototype[_[v]]);o.defineProperty(d.prototype,"length",{value:0,configurable:!1,writable:!0,enumerable:!0}),d.prototype.isOperational=!0;var y=0;function m(t){if(!(this instanceof m))return new m(t);c(this,"name","OperationalError"),c(this,"message",t),this.cause=t,this.isOperational=!0,t instanceof Error?(c(this,"message",t.message),c(this,"stack",t.stack)):Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor);}d.prototype.toString=function(){var t=Array(4*y+1).join(" "),e="\n"+t+"AggregateError of:\n";y++,t=Array(4*y+1).join(" ");for(var r=0;r<this.length;++r){for(var n=this[r]===this?"[Circular AggregateError]":this[r]+"",i=n.split("\n"),o=0;o<i.length;++o)i[o]=t+i[o];e+=(n=i.join("\n"))+"\n";}return y--,e},u(m,Error);var g=Error.__BluebirdErrorTypes__;g||(g=s({CancellationError:h,TimeoutError:p,OperationalError:m,RejectionError:m,AggregateError:d}),o.defineProperty(Error,"__BluebirdErrorTypes__",{value:g,writable:!1,enumerable:!1,configurable:!1})),e.exports={Error:Error,TypeError:n,RangeError:i,CancellationError:g.CancellationError,OperationalError:g.OperationalError,TimeoutError:g.TimeoutError,AggregateError:g.AggregateError,Warning:f};},{"./es5":13,"./util":36}],13:[function(t,e,r){var n=function(){return void 0===this}();if(n)e.exports={freeze:Object.freeze,defineProperty:Object.defineProperty,getDescriptor:Object.getOwnPropertyDescriptor,keys:Object.keys,names:Object.getOwnPropertyNames,getPrototypeOf:Object.getPrototypeOf,isArray:Array.isArray,isES5:n,propertyIsWritable:function(t,e){var r=Object.getOwnPropertyDescriptor(t,e);return !(r&&!r.writable&&!r.set)}};else {var i={}.hasOwnProperty,o={}.toString,s={}.constructor.prototype,a=function(t){var e=[];for(var r in t)i.call(t,r)&&e.push(r);return e};e.exports={isArray:function(t){try{return "[object Array]"===o.call(t)}catch(t){return !1}},keys:a,names:a,defineProperty:function(t,e,r){return t[e]=r.value,t},getDescriptor:function(t,e){return {value:t[e]}},freeze:function(t){return t},getPrototypeOf:function(t){try{return Object(t).constructor.prototype}catch(t){return s}},isES5:n,propertyIsWritable:function(){return !0}};}},{}],14:[function(t,e,r){e.exports=function(t,e){var r=t.map;t.prototype.filter=function(t,n){return r(this,t,n,e)},t.filter=function(t,n,i){return r(t,n,i,e)};};},{}],15:[function(t,e,r){e.exports=function(e,r,n){var i=t("./util"),o=e.CancellationError,s=i.errorObj,a=t("./catch_filter")(n);function u(t,e,r){this.promise=t,this.type=e,this.handler=r,this.called=!1,this.cancelPromise=null;}function c(t){this.finallyHandler=t;}function l(t,e){return null!=t.cancelPromise&&(arguments.length>1?t.cancelPromise._reject(e):t.cancelPromise._cancel(),t.cancelPromise=null,!0)}function f(){return p.call(this,this.promise._target()._settledValue())}function h(t){if(!l(this,t))return s.e=t,s}function p(t){var i=this.promise,a=this.handler;if(!this.called){this.called=!0;var u=this.isFinallyHandler()?a.call(i._boundValue()):a.call(i._boundValue(),t);if(u===n)return u;if(void 0!==u){i._setReturnedNonUndefined();var p=r(u,i);if(p instanceof e){if(null!=this.cancelPromise){if(p._isCancelled()){var d=new o("late cancellation observer");return i._attachExtraTrace(d),s.e=d,s}p.isPending()&&p._attachCancellationCallback(new c(this));}return p._then(f,h,void 0,this,void 0)}}}return i.isRejected()?(l(this),s.e=t,s):(l(this),t)}return u.prototype.isFinallyHandler=function(){return 0===this.type},c.prototype._resultCancelled=function(){l(this.finallyHandler);},e.prototype._passThrough=function(t,e,r,n){return "function"!=typeof t?this.then():this._then(r,n,void 0,new u(this,e,t),void 0)},e.prototype.lastly=e.prototype.finally=function(t){return this._passThrough(t,0,p,p)},e.prototype.tap=function(t){return this._passThrough(t,1,p)},e.prototype.tapCatch=function(t){var r=arguments.length;if(1===r)return this._passThrough(t,1,void 0,p);var n,o=new Array(r-1),s=0;for(n=0;n<r-1;++n){var u=arguments[n];if(!i.isObject(u))return e.reject(new TypeError("tapCatch statement predicate: expecting an object but got "+i.classString(u)));o[s++]=u;}o.length=s;var c=arguments[n];return this._passThrough(a(o,c,this),1,void 0,p)},u};},{"./catch_filter":7,"./util":36}],16:[function(t,e,r){e.exports=function(e,r,n,i,o,s){var a=t("./errors").TypeError,u=t("./util"),c=u.errorObj,l=u.tryCatch,f=[];function h(t,r,i,o){if(s.cancellation()){var a=new e(n),u=this._finallyPromise=new e(n);this._promise=a.lastly(function(){return u}),a._captureStackTrace(),a._setOnCancel(this);}else (this._promise=new e(n))._captureStackTrace();this._stack=o,this._generatorFunction=t,this._receiver=r,this._generator=void 0,this._yieldHandlers="function"==typeof i?[i].concat(f):f,this._yieldedPromise=null,this._cancellationPhase=!1;}u.inherits(h,o),h.prototype._isResolved=function(){return null===this._promise},h.prototype._cleanup=function(){this._promise=this._generator=null,s.cancellation()&&null!==this._finallyPromise&&(this._finallyPromise._fulfill(),this._finallyPromise=null);},h.prototype._promiseCancelled=function(){if(!this._isResolved()){var t;if(void 0!==this._generator.return)this._promise._pushContext(),t=l(this._generator.return).call(this._generator,void 0),this._promise._popContext();else {var r=new e.CancellationError("generator .return() sentinel");e.coroutine.returnSentinel=r,this._promise._attachExtraTrace(r),this._promise._pushContext(),t=l(this._generator.throw).call(this._generator,r),this._promise._popContext();}this._cancellationPhase=!0,this._yieldedPromise=null,this._continue(t);}},h.prototype._promiseFulfilled=function(t){this._yieldedPromise=null,this._promise._pushContext();var e=l(this._generator.next).call(this._generator,t);this._promise._popContext(),this._continue(e);},h.prototype._promiseRejected=function(t){this._yieldedPromise=null,this._promise._attachExtraTrace(t),this._promise._pushContext();var e=l(this._generator.throw).call(this._generator,t);this._promise._popContext(),this._continue(e);},h.prototype._resultCancelled=function(){if(this._yieldedPromise instanceof e){var t=this._yieldedPromise;this._yieldedPromise=null,t.cancel();}},h.prototype.promise=function(){return this._promise},h.prototype._run=function(){this._generator=this._generatorFunction.call(this._receiver),this._receiver=this._generatorFunction=void 0,this._promiseFulfilled(void 0);},h.prototype._continue=function(t){var r=this._promise;if(t===c)return this._cleanup(),this._cancellationPhase?r.cancel():r._rejectCallback(t.e,!1);var n=t.value;if(!0===t.done)return this._cleanup(),this._cancellationPhase?r.cancel():r._resolveCallback(n);var o=i(n,this._promise);if(o instanceof e||null!==(o=function(t,r,n){for(var o=0;o<r.length;++o){n._pushContext();var s=l(r[o])(t);if(n._popContext(),s===c){n._pushContext();var a=e.reject(c.e);return n._popContext(),a}var u=i(s,n);if(u instanceof e)return u}return null}(o,this._yieldHandlers,this._promise))){var s=(o=o._target())._bitField;0==(50397184&s)?(this._yieldedPromise=o,o._proxy(this,null)):0!=(33554432&s)?e._async.invoke(this._promiseFulfilled,this,o._value()):0!=(16777216&s)?e._async.invoke(this._promiseRejected,this,o._reason()):this._promiseCancelled();}else this._promiseRejected(new a("A value %s was yielded that could not be treated as a promise\n\n    See http://goo.gl/MqrFmX\n\n".replace("%s",String(n))+"From coroutine:\n"+this._stack.split("\n").slice(1,-7).join("\n")));},e.coroutine=function(t,e){if("function"!=typeof t)throw new a("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");var r=Object(e).yieldHandler,n=h,i=(new Error).stack;return function(){var e=t.apply(this,arguments),o=new n(void 0,void 0,r,i),s=o.promise();return o._generator=e,o._promiseFulfilled(void 0),s}},e.coroutine.addYieldHandler=function(t){if("function"!=typeof t)throw new a("expecting a function but got "+u.classString(t));f.push(t);},e.spawn=function(t){if(s.deprecated("Promise.spawn()","Promise.coroutine()"),"function"!=typeof t)return r("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");var n=new h(t,this),i=n.promise();return n._run(e.spawn),i};};},{"./errors":12,"./util":36}],17:[function(t,e,r){e.exports=function(e,r,n,i,o,s){var a=t("./util");a.canEvaluate,a.tryCatch,a.errorObj,e.join=function(){var t,e=arguments.length-1;e>0&&"function"==typeof arguments[e]&&(t=arguments[e]);var n=[].slice.call(arguments);t&&n.pop();var i=new r(n).promise();return void 0!==t?i.spread(t):i};};},{"./util":36}],18:[function(t,e,r){e.exports=function(e,r,n,i,o,s){var a=e._getDomain,u=t("./util"),c=u.tryCatch,l=u.errorObj,f=e._async;function h(t,e,r,n){this.constructor$(t),this._promise._captureStackTrace();var i=a();this._callback=null===i?e:u.domainBind(i,e),this._preservedValues=n===o?new Array(this.length()):null,this._limit=r,this._inFlight=0,this._queue=[],f.invoke(this._asyncInit,this,void 0);}function p(t,r,i,o){if("function"!=typeof r)return n("expecting a function but got "+u.classString(r));var s=0;if(void 0!==i){if("object"!=typeof i||null===i)return e.reject(new TypeError("options argument must be an object but it is "+u.classString(i)));if("number"!=typeof i.concurrency)return e.reject(new TypeError("'concurrency' must be a number but it is "+u.classString(i.concurrency)));s=i.concurrency;}return new h(t,r,s="number"==typeof s&&isFinite(s)&&s>=1?s:0,o).promise()}u.inherits(h,r),h.prototype._asyncInit=function(){this._init$(void 0,-2);},h.prototype._init=function(){},h.prototype._promiseFulfilled=function(t,r){var n=this._values,o=this.length(),a=this._preservedValues,u=this._limit;if(r<0){if(n[r=-1*r-1]=t,u>=1&&(this._inFlight--,this._drainQueue(),this._isResolved()))return !0}else {if(u>=1&&this._inFlight>=u)return n[r]=t,this._queue.push(r),!1;null!==a&&(a[r]=t);var f=this._promise,h=this._callback,p=f._boundValue();f._pushContext();var d=c(h).call(p,t,r,o),_=f._popContext();if(s.checkForgottenReturns(d,_,null!==a?"Promise.filter":"Promise.map",f),d===l)return this._reject(d.e),!0;var v=i(d,this._promise);if(v instanceof e){var y=(v=v._target())._bitField;if(0==(50397184&y))return u>=1&&this._inFlight++,n[r]=v,v._proxy(this,-1*(r+1)),!1;if(0==(33554432&y))return 0!=(16777216&y)?(this._reject(v._reason()),!0):(this._cancel(),!0);d=v._value();}n[r]=d;}return ++this._totalResolved>=o&&(null!==a?this._filter(n,a):this._resolve(n),!0)},h.prototype._drainQueue=function(){for(var t=this._queue,e=this._limit,r=this._values;t.length>0&&this._inFlight<e;){if(this._isResolved())return;var n=t.pop();this._promiseFulfilled(r[n],n);}},h.prototype._filter=function(t,e){for(var r=e.length,n=new Array(r),i=0,o=0;o<r;++o)t[o]&&(n[i++]=e[o]);n.length=i,this._resolve(n);},h.prototype.preservedValues=function(){return this._preservedValues},e.prototype.map=function(t,e){return p(this,t,e,null)},e.map=function(t,e,r,n){return p(t,e,r,n)};};},{"./util":36}],19:[function(t,e,r){e.exports=function(e,r,n,i,o){var s=t("./util"),a=s.tryCatch;e.method=function(t){if("function"!=typeof t)throw new e.TypeError("expecting a function but got "+s.classString(t));return function(){var n=new e(r);n._captureStackTrace(),n._pushContext();var i=a(t).apply(this,arguments),s=n._popContext();return o.checkForgottenReturns(i,s,"Promise.method",n),n._resolveFromSyncValue(i),n}},e.attempt=e.try=function(t){if("function"!=typeof t)return i("expecting a function but got "+s.classString(t));var n,u=new e(r);if(u._captureStackTrace(),u._pushContext(),arguments.length>1){o.deprecated("calling Promise.try with more than 1 argument");var c=arguments[1],l=arguments[2];n=s.isArray(c)?a(t).apply(l,c):a(t).call(l,c);}else n=a(t)();var f=u._popContext();return o.checkForgottenReturns(n,f,"Promise.try",u),u._resolveFromSyncValue(n),u},e.prototype._resolveFromSyncValue=function(t){t===s.errorObj?this._rejectCallback(t.e,!1):this._resolveCallback(t,!0);};};},{"./util":36}],20:[function(t,e,r){var n=t("./util"),i=n.maybeWrapAsError,o=t("./errors").OperationalError,s=t("./es5"),a=/^(?:name|message|stack|cause)$/;function u(t){var e;if(function(t){return t instanceof Error&&s.getPrototypeOf(t)===Error.prototype}(t)){(e=new o(t)).name=t.name,e.message=t.message,e.stack=t.stack;for(var r=s.keys(t),i=0;i<r.length;++i){var u=r[i];a.test(u)||(e[u]=t[u]);}return e}return n.markAsOriginatingFromRejection(t),t}e.exports=function(t,e){return function(r,n){if(null!==t){if(r){var o=u(i(r));t._attachExtraTrace(o),t._reject(o);}else if(e){var s=[].slice.call(arguments,1);t._fulfill(s);}else t._fulfill(n);t=null;}}};},{"./errors":12,"./es5":13,"./util":36}],21:[function(t,e,r){e.exports=function(e){var r=t("./util"),n=e._async,i=r.tryCatch,o=r.errorObj;function s(t,e){if(!r.isArray(t))return a.call(this,t,e);var s=i(e).apply(this._boundValue(),[null].concat(t));s===o&&n.throwLater(s.e);}function a(t,e){var r=this._boundValue(),s=void 0===t?i(e).call(r,null):i(e).call(r,null,t);s===o&&n.throwLater(s.e);}function u(t,e){if(!t){var r=new Error(t+"");r.cause=t,t=r;}var s=i(e).call(this._boundValue(),t);s===o&&n.throwLater(s.e);}e.prototype.asCallback=e.prototype.nodeify=function(t,e){if("function"==typeof t){var r=a;void 0!==e&&Object(e).spread&&(r=s),this._then(r,u,void 0,this,t);}return this};};},{"./util":36}],22:[function(t,r,n){r.exports=function(){var n=function(){return new d("circular promise resolution chain\n\n    See http://goo.gl/MqrFmX\n")},i=function(){return new T.PromiseInspection(this._target())},o=function(t){return T.reject(new d(t))};function s(){}var a,u={},c=t("./util");a=c.isNode?function(){var t=e.domain;return void 0===t&&(t=null),t}:function(){return null},c.notEnumerableProp(T,"_getDomain",a);var l=t("./es5"),f=t("./async"),h=new f;l.defineProperty(T,"_async",{value:h});var p=t("./errors"),d=T.TypeError=p.TypeError;T.RangeError=p.RangeError;var _=T.CancellationError=p.CancellationError;T.TimeoutError=p.TimeoutError,T.OperationalError=p.OperationalError,T.RejectionError=p.OperationalError,T.AggregateError=p.AggregateError;var v=function(){},y={},m={},g=t("./thenables")(T,v),b=t("./promise_array")(T,v,g,o,s),w=t("./context")(T),E=w.create,C=t("./debuggability")(T,w),x=(C.CapturedTrace,t("./finally")(T,g,m)),j=t("./catch_filter")(m),S=t("./nodeback"),R=c.errorObj,k=c.tryCatch;function T(t){t!==v&&function(t,e){if(null==t||t.constructor!==T)throw new d("the promise constructor cannot be invoked directly\n\n    See http://goo.gl/MqrFmX\n");if("function"!=typeof e)throw new d("expecting a function but got "+c.classString(e))}(this,t),this._bitField=0,this._fulfillmentHandler0=void 0,this._rejectionHandler0=void 0,this._promise0=void 0,this._receiver0=void 0,this._resolveFromExecutor(t),this._promiseCreated(),this._fireEvent("promiseCreated",this);}function P(t){this.promise._resolveCallback(t);}function O(t){this.promise._rejectCallback(t,!1);}function A(t){var e=new T(v);e._fulfillmentHandler0=t,e._rejectionHandler0=t,e._promise0=t,e._receiver0=t;}return T.prototype.toString=function(){return "[object Promise]"},T.prototype.caught=T.prototype.catch=function(t){var e=arguments.length;if(e>1){var r,n=new Array(e-1),i=0;for(r=0;r<e-1;++r){var s=arguments[r];if(!c.isObject(s))return o("Catch statement predicate: expecting an object but got "+c.classString(s));n[i++]=s;}return n.length=i,t=arguments[r],this.then(void 0,j(n,t,this))}return this.then(void 0,t)},T.prototype.reflect=function(){return this._then(i,i,void 0,this,void 0)},T.prototype.then=function(t,e){if(C.warnings()&&arguments.length>0&&"function"!=typeof t&&"function"!=typeof e){var r=".then() only accepts functions but was passed: "+c.classString(t);arguments.length>1&&(r+=", "+c.classString(e)),this._warn(r);}return this._then(t,e,void 0,void 0,void 0)},T.prototype.done=function(t,e){this._then(t,e,void 0,void 0,void 0)._setIsFinal();},T.prototype.spread=function(t){return "function"!=typeof t?o("expecting a function but got "+c.classString(t)):this.all()._then(t,void 0,void 0,y,void 0)},T.prototype.toJSON=function(){var t={isFulfilled:!1,isRejected:!1,fulfillmentValue:void 0,rejectionReason:void 0};return this.isFulfilled()?(t.fulfillmentValue=this.value(),t.isFulfilled=!0):this.isRejected()&&(t.rejectionReason=this.reason(),t.isRejected=!0),t},T.prototype.all=function(){return arguments.length>0&&this._warn(".all() was passed arguments but it does not take any"),new b(this).promise()},T.prototype.error=function(t){return this.caught(c.originatesFromRejection,t)},T.getNewLibraryCopy=r.exports,T.is=function(t){return t instanceof T},T.fromNode=T.fromCallback=function(t){var e=new T(v);e._captureStackTrace();var r=arguments.length>1&&!!Object(arguments[1]).multiArgs,n=k(t)(S(e,r));return n===R&&e._rejectCallback(n.e,!0),e._isFateSealed()||e._setAsyncGuaranteed(),e},T.all=function(t){return new b(t).promise()},T.cast=function(t){var e=g(t);return e instanceof T||((e=new T(v))._captureStackTrace(),e._setFulfilled(),e._rejectionHandler0=t),e},T.resolve=T.fulfilled=T.cast,T.reject=T.rejected=function(t){var e=new T(v);return e._captureStackTrace(),e._rejectCallback(t,!0),e},T.setScheduler=function(t){if("function"!=typeof t)throw new d("expecting a function but got "+c.classString(t));return h.setScheduler(t)},T.prototype._then=function(t,e,r,n,i){var o=void 0!==i,s=o?i:new T(v),u=this._target(),l=u._bitField;o||(s._propagateFrom(this,3),s._captureStackTrace(),void 0===n&&0!=(2097152&this._bitField)&&(n=0!=(50397184&l)?this._boundValue():u===this?void 0:this._boundTo),this._fireEvent("promiseChained",this,s));var f=a();if(0!=(50397184&l)){var p,d,y=u._settlePromiseCtx;0!=(33554432&l)?(d=u._rejectionHandler0,p=t):0!=(16777216&l)?(d=u._fulfillmentHandler0,p=e,u._unsetRejectionIsUnhandled()):(y=u._settlePromiseLateCancellationObserver,d=new _("late cancellation observer"),u._attachExtraTrace(d),p=e),h.invoke(y,u,{handler:null===f?p:"function"==typeof p&&c.domainBind(f,p),promise:s,receiver:n,value:d});}else u._addCallbacks(t,e,s,n,f);return s},T.prototype._length=function(){return 65535&this._bitField},T.prototype._isFateSealed=function(){return 0!=(117506048&this._bitField)},T.prototype._isFollowing=function(){return 67108864==(67108864&this._bitField)},T.prototype._setLength=function(t){this._bitField=-65536&this._bitField|65535&t;},T.prototype._setFulfilled=function(){this._bitField=33554432|this._bitField,this._fireEvent("promiseFulfilled",this);},T.prototype._setRejected=function(){this._bitField=16777216|this._bitField,this._fireEvent("promiseRejected",this);},T.prototype._setFollowing=function(){this._bitField=67108864|this._bitField,this._fireEvent("promiseResolved",this);},T.prototype._setIsFinal=function(){this._bitField=4194304|this._bitField;},T.prototype._isFinal=function(){return (4194304&this._bitField)>0},T.prototype._unsetCancelled=function(){this._bitField=-65537&this._bitField;},T.prototype._setCancelled=function(){this._bitField=65536|this._bitField,this._fireEvent("promiseCancelled",this);},T.prototype._setWillBeCancelled=function(){this._bitField=8388608|this._bitField;},T.prototype._setAsyncGuaranteed=function(){h.hasCustomScheduler()||(this._bitField=134217728|this._bitField);},T.prototype._receiverAt=function(t){var e=0===t?this._receiver0:this[4*t-4+3];if(e!==u)return void 0===e&&this._isBound()?this._boundValue():e},T.prototype._promiseAt=function(t){return this[4*t-4+2]},T.prototype._fulfillmentHandlerAt=function(t){return this[4*t-4+0]},T.prototype._rejectionHandlerAt=function(t){return this[4*t-4+1]},T.prototype._boundValue=function(){},T.prototype._migrateCallback0=function(t){t._bitField;var e=t._fulfillmentHandler0,r=t._rejectionHandler0,n=t._promise0,i=t._receiverAt(0);void 0===i&&(i=u),this._addCallbacks(e,r,n,i,null);},T.prototype._migrateCallbackAt=function(t,e){var r=t._fulfillmentHandlerAt(e),n=t._rejectionHandlerAt(e),i=t._promiseAt(e),o=t._receiverAt(e);void 0===o&&(o=u),this._addCallbacks(r,n,i,o,null);},T.prototype._addCallbacks=function(t,e,r,n,i){var o=this._length();if(o>=65531&&(o=0,this._setLength(0)),0===o)this._promise0=r,this._receiver0=n,"function"==typeof t&&(this._fulfillmentHandler0=null===i?t:c.domainBind(i,t)),"function"==typeof e&&(this._rejectionHandler0=null===i?e:c.domainBind(i,e));else {var s=4*o-4;this[s+2]=r,this[s+3]=n,"function"==typeof t&&(this[s+0]=null===i?t:c.domainBind(i,t)),"function"==typeof e&&(this[s+1]=null===i?e:c.domainBind(i,e));}return this._setLength(o+1),o},T.prototype._proxy=function(t,e){this._addCallbacks(void 0,void 0,e,t,null);},T.prototype._resolveCallback=function(t,e){if(0==(117506048&this._bitField)){if(t===this)return this._rejectCallback(n(),!1);var r=g(t,this);if(!(r instanceof T))return this._fulfill(t);e&&this._propagateFrom(r,2);var i=r._target();if(i!==this){var o=i._bitField;if(0==(50397184&o)){var s=this._length();s>0&&i._migrateCallback0(this);for(var a=1;a<s;++a)i._migrateCallbackAt(this,a);this._setFollowing(),this._setLength(0),this._setFollowee(i);}else if(0!=(33554432&o))this._fulfill(i._value());else if(0!=(16777216&o))this._reject(i._reason());else {var u=new _("late cancellation observer");i._attachExtraTrace(u),this._reject(u);}}else this._reject(n());}},T.prototype._rejectCallback=function(t,e,r){var n=c.ensureErrorObject(t),i=n===t;if(!i&&!r&&C.warnings()){var o="a promise was rejected with a non-error: "+c.classString(t);this._warn(o,!0);}this._attachExtraTrace(n,!!e&&i),this._reject(t);},T.prototype._resolveFromExecutor=function(t){if(t!==v){var e=this;this._captureStackTrace(),this._pushContext();var r=!0,n=this._execute(t,function(t){e._resolveCallback(t);},function(t){e._rejectCallback(t,r);});r=!1,this._popContext(),void 0!==n&&e._rejectCallback(n,!0);}},T.prototype._settlePromiseFromHandler=function(t,e,r,n){var i=n._bitField;if(0==(65536&i)){var o;n._pushContext(),e===y?r&&"number"==typeof r.length?o=k(t).apply(this._boundValue(),r):(o=R).e=new d("cannot .spread() a non-array: "+c.classString(r)):o=k(t).call(e,r);var s=n._popContext();0==(65536&(i=n._bitField))&&(o===m?n._reject(r):o===R?n._rejectCallback(o.e,!1):(C.checkForgottenReturns(o,s,"",n,this),n._resolveCallback(o)));}},T.prototype._target=function(){for(var t=this;t._isFollowing();)t=t._followee();return t},T.prototype._followee=function(){return this._rejectionHandler0},T.prototype._setFollowee=function(t){this._rejectionHandler0=t;},T.prototype._settlePromise=function(t,e,r,n){var o=t instanceof T,a=this._bitField,u=0!=(134217728&a);0!=(65536&a)?(o&&t._invokeInternalOnCancel(),r instanceof x&&r.isFinallyHandler()?(r.cancelPromise=t,k(e).call(r,n)===R&&t._reject(R.e)):e===i?t._fulfill(i.call(r)):r instanceof s?r._promiseCancelled(t):o||t instanceof b?t._cancel():r.cancel()):"function"==typeof e?o?(u&&t._setAsyncGuaranteed(),this._settlePromiseFromHandler(e,r,n,t)):e.call(r,n,t):r instanceof s?r._isResolved()||(0!=(33554432&a)?r._promiseFulfilled(n,t):r._promiseRejected(n,t)):o&&(u&&t._setAsyncGuaranteed(),0!=(33554432&a)?t._fulfill(n):t._reject(n));},T.prototype._settlePromiseLateCancellationObserver=function(t){var e=t.handler,r=t.promise,n=t.receiver,i=t.value;"function"==typeof e?r instanceof T?this._settlePromiseFromHandler(e,n,i,r):e.call(n,i,r):r instanceof T&&r._reject(i);},T.prototype._settlePromiseCtx=function(t){this._settlePromise(t.promise,t.handler,t.receiver,t.value);},T.prototype._settlePromise0=function(t,e,r){var n=this._promise0,i=this._receiverAt(0);this._promise0=void 0,this._receiver0=void 0,this._settlePromise(n,t,i,e);},T.prototype._clearCallbackDataAtIndex=function(t){var e=4*t-4;this[e+2]=this[e+3]=this[e+0]=this[e+1]=void 0;},T.prototype._fulfill=function(t){var e=this._bitField;if(!((117506048&e)>>>16)){if(t===this){var r=n();return this._attachExtraTrace(r),this._reject(r)}this._setFulfilled(),this._rejectionHandler0=t,(65535&e)>0&&(0!=(134217728&e)?this._settlePromises():h.settlePromises(this));}},T.prototype._reject=function(t){var e=this._bitField;if(!((117506048&e)>>>16)){if(this._setRejected(),this._fulfillmentHandler0=t,this._isFinal())return h.fatalError(t,c.isNode);(65535&e)>0?h.settlePromises(this):this._ensurePossibleRejectionHandled();}},T.prototype._fulfillPromises=function(t,e){for(var r=1;r<t;r++){var n=this._fulfillmentHandlerAt(r),i=this._promiseAt(r),o=this._receiverAt(r);this._clearCallbackDataAtIndex(r),this._settlePromise(i,n,o,e);}},T.prototype._rejectPromises=function(t,e){for(var r=1;r<t;r++){var n=this._rejectionHandlerAt(r),i=this._promiseAt(r),o=this._receiverAt(r);this._clearCallbackDataAtIndex(r),this._settlePromise(i,n,o,e);}},T.prototype._settlePromises=function(){var t=this._bitField,e=65535&t;if(e>0){if(0!=(16842752&t)){var r=this._fulfillmentHandler0;this._settlePromise0(this._rejectionHandler0,r,t),this._rejectPromises(e,r);}else {var n=this._rejectionHandler0;this._settlePromise0(this._fulfillmentHandler0,n,t),this._fulfillPromises(e,n);}this._setLength(0);}this._clearCancellationData();},T.prototype._settledValue=function(){var t=this._bitField;return 0!=(33554432&t)?this._rejectionHandler0:0!=(16777216&t)?this._fulfillmentHandler0:void 0},T.defer=T.pending=function(){return C.deprecated("Promise.defer","new Promise"),{promise:new T(v),resolve:P,reject:O}},c.notEnumerableProp(T,"_makeSelfResolutionError",n),t("./method")(T,v,g,o,C),t("./bind")(T,v,g,C),t("./cancel")(T,b,o,C),t("./direct_resolve")(T),t("./synchronous_inspection")(T),t("./join")(T,b,g,v,h,a),T.Promise=T,T.version="3.5.1",t("./map.js")(T,b,o,g,v,C),t("./call_get.js")(T),t("./using.js")(T,o,g,E,v,C),t("./timers.js")(T,v,C),t("./generators.js")(T,o,v,g,s,C),t("./nodeify.js")(T),t("./promisify.js")(T,v),t("./props.js")(T,b,g,o),t("./race.js")(T,v,g,o),t("./reduce.js")(T,b,o,g,v,C),t("./settle.js")(T,b,C),t("./some.js")(T,b,o),t("./filter.js")(T,v),t("./each.js")(T,v),t("./any.js")(T),c.toFastProperties(T),c.toFastProperties(T.prototype),A({a:1}),A({b:2}),A({c:3}),A(1),A(function(){}),A(void 0),A(!1),A(new T(v)),C.setBounds(f.firstLineError,c.lastLineError),T};},{"./any.js":1,"./async":2,"./bind":3,"./call_get.js":5,"./cancel":6,"./catch_filter":7,"./context":8,"./debuggability":9,"./direct_resolve":10,"./each.js":11,"./errors":12,"./es5":13,"./filter.js":14,"./finally":15,"./generators.js":16,"./join":17,"./map.js":18,"./method":19,"./nodeback":20,"./nodeify.js":21,"./promise_array":23,"./promisify.js":24,"./props.js":25,"./race.js":27,"./reduce.js":28,"./settle.js":30,"./some.js":31,"./synchronous_inspection":32,"./thenables":33,"./timers.js":34,"./using.js":35,"./util":36}],23:[function(t,e,r){e.exports=function(e,r,n,i,o){var s=t("./util");function a(t){var n=this._promise=new e(r);t instanceof e&&n._propagateFrom(t,3),n._setOnCancel(this),this._values=t,this._length=0,this._totalResolved=0,this._init(void 0,-2);}return s.isArray,s.inherits(a,o),a.prototype.length=function(){return this._length},a.prototype.promise=function(){return this._promise},a.prototype._init=function t(r,o){var a=n(this._values,this._promise);if(a instanceof e){var u=(a=a._target())._bitField;if(this._values=a,0==(50397184&u))return this._promise._setAsyncGuaranteed(),a._then(t,this._reject,void 0,this,o);if(0==(33554432&u))return 0!=(16777216&u)?this._reject(a._reason()):this._cancel();a=a._value();}if(null!==(a=s.asArray(a)))0!==a.length?this._iterate(a):-5===o?this._resolveEmptyArray():this._resolve(function(t){switch(o){case-2:return [];case-3:return {};case-6:return new Map}}());else {var c=i("expecting an array or an iterable object but got "+s.classString(a)).reason();this._promise._rejectCallback(c,!1);}},a.prototype._iterate=function(t){var r=this.getActualLength(t.length);this._length=r,this._values=this.shouldCopyValues()?new Array(r):this._values;for(var i=this._promise,o=!1,s=null,a=0;a<r;++a){var u=n(t[a],i);s=u instanceof e?(u=u._target())._bitField:null,o?null!==s&&u.suppressUnhandledRejections():null!==s?0==(50397184&s)?(u._proxy(this,a),this._values[a]=u):o=0!=(33554432&s)?this._promiseFulfilled(u._value(),a):0!=(16777216&s)?this._promiseRejected(u._reason(),a):this._promiseCancelled(a):o=this._promiseFulfilled(u,a);}o||i._setAsyncGuaranteed();},a.prototype._isResolved=function(){return null===this._values},a.prototype._resolve=function(t){this._values=null,this._promise._fulfill(t);},a.prototype._cancel=function(){!this._isResolved()&&this._promise._isCancellable()&&(this._values=null,this._promise._cancel());},a.prototype._reject=function(t){this._values=null,this._promise._rejectCallback(t,!1);},a.prototype._promiseFulfilled=function(t,e){return this._values[e]=t,++this._totalResolved>=this._length&&(this._resolve(this._values),!0)},a.prototype._promiseCancelled=function(){return this._cancel(),!0},a.prototype._promiseRejected=function(t){return this._totalResolved++,this._reject(t),!0},a.prototype._resultCancelled=function(){if(!this._isResolved()){var t=this._values;if(this._cancel(),t instanceof e)t.cancel();else for(var r=0;r<t.length;++r)t[r]instanceof e&&t[r].cancel();}},a.prototype.shouldCopyValues=function(){return !0},a.prototype.getActualLength=function(t){return t},a};},{"./util":36}],24:[function(t,e,r){e.exports=function(e,r){var n={},i=t("./util"),o=t("./nodeback"),s=i.withAppended,a=i.maybeWrapAsError,u=i.canEvaluate,c=t("./errors").TypeError,l={__isPromisified__:!0},f=new RegExp("^(?:"+["arity","length","name","arguments","caller","callee","prototype","__isPromisified__"].join("|")+")$"),h=function(t){return i.isIdentifier(t)&&"_"!==t.charAt(0)&&"constructor"!==t};function p(t){return !f.test(t)}function d(t){try{return !0===t.__isPromisified__}catch(t){return !1}}function _(t,e,r){var n=i.getDataPropertyOrDefault(t,e+r,l);return !!n&&d(n)}function v(t,e,r,n){for(var o=i.inheritedDataKeys(t),s=[],a=0;a<o.length;++a){var u=o[a],l=t[u],f=n===h||h(u);"function"!=typeof l||d(l)||_(t,u,e)||!n(u,l,t,f)||s.push(u,l);}return function(t,e,r){for(var n=0;n<t.length;n+=2){var i=t[n];if(r.test(i))for(var o=i.replace(r,""),s=0;s<t.length;s+=2)if(t[s]===o)throw new c("Cannot promisify an API that has normal methods with '%s'-suffix\n\n    See http://goo.gl/MqrFmX\n".replace("%s",e))}}(s,e,r),s}var y=function(t){return t.replace(/([$])/,"\\$")},m=u?void 0:function(t,u,c,l,f,h){var p=function(){return this}(),d=t;function _(){var i=u;u===n&&(i=this);var c=new e(r);c._captureStackTrace();var l="string"==typeof d&&this!==p?this[d]:t,f=o(c,h);try{l.apply(i,s(arguments,f));}catch(t){c._rejectCallback(a(t),!0,!0);}return c._isFateSealed()||c._setAsyncGuaranteed(),c}return "string"==typeof d&&(t=l),i.notEnumerableProp(_,"__isPromisified__",!0),_};function g(t,e,r,o,s){for(var a=new RegExp(y(e)+"$"),u=v(t,e,a,r),c=0,l=u.length;c<l;c+=2){var f=u[c],h=u[c+1],p=f+e;if(o===m)t[p]=m(f,n,f,h,e,s);else {var d=o(h,function(){return m(f,n,f,h,e,s)});i.notEnumerableProp(d,"__isPromisified__",!0),t[p]=d;}}return i.toFastProperties(t),t}e.promisify=function(t,e){if("function"!=typeof t)throw new c("expecting a function but got "+i.classString(t));if(d(t))return t;var r=void 0===(e=Object(e)).context?n:e.context,o=!!e.multiArgs,s=function(t,e,r){return m(t,e,void 0,t,null,o)}(t,r);return i.copyDescriptors(t,s,p),s},e.promisifyAll=function(t,e){if("function"!=typeof t&&"object"!=typeof t)throw new c("the target of promisifyAll must be an object or a function\n\n    See http://goo.gl/MqrFmX\n");var r=!!(e=Object(e)).multiArgs,n=e.suffix;"string"!=typeof n&&(n="Async");var o=e.filter;"function"!=typeof o&&(o=h);var s=e.promisifier;if("function"!=typeof s&&(s=m),!i.isIdentifier(n))throw new RangeError("suffix must be a valid identifier\n\n    See http://goo.gl/MqrFmX\n");for(var a=i.inheritedDataKeys(t),u=0;u<a.length;++u){var l=t[a[u]];"constructor"!==a[u]&&i.isClass(l)&&(g(l.prototype,n,o,s,r),g(l,n,o,s,r));}return g(t,n,o,s,r)};};},{"./errors":12,"./nodeback":20,"./util":36}],25:[function(t,e,r){e.exports=function(e,r,n,i){var o,s=t("./util"),a=s.isObject,u=t("./es5");"function"==typeof Map&&(o=Map);var c=function(){var t=0,e=0;function r(r,n){this[t]=r,this[t+e]=n,t++;}return function(n){e=n.size,t=0;var i=new Array(2*n.size);return n.forEach(r,i),i}}();function l(t){var e,r=!1;if(void 0!==o&&t instanceof o)e=c(t),r=!0;else {var n=u.keys(t),i=n.length;e=new Array(2*i);for(var s=0;s<i;++s){var a=n[s];e[s]=t[a],e[s+i]=a;}}this.constructor$(e),this._isMap=r,this._init$(void 0,r?-6:-3);}function f(t){var r,o=n(t);return a(o)?(r=o instanceof e?o._then(e.props,void 0,void 0,void 0,void 0):new l(o).promise(),o instanceof e&&r._propagateFrom(o,2),r):i("cannot await properties of a non-object\n\n    See http://goo.gl/MqrFmX\n")}s.inherits(l,r),l.prototype._init=function(){},l.prototype._promiseFulfilled=function(t,e){if(this._values[e]=t,++this._totalResolved>=this._length){var r;if(this._isMap)r=function(t){for(var e=new o,r=t.length/2|0,n=0;n<r;++n){var i=t[r+n],s=t[n];e.set(i,s);}return e}(this._values);else {r={};for(var n=this.length(),i=0,s=this.length();i<s;++i)r[this._values[i+n]]=this._values[i];}return this._resolve(r),!0}return !1},l.prototype.shouldCopyValues=function(){return !1},l.prototype.getActualLength=function(t){return t>>1},e.prototype.props=function(){return f(this)},e.props=function(t){return f(t)};};},{"./es5":13,"./util":36}],26:[function(t,e,r){function n(t){this._capacity=t,this._length=0,this._front=0;}n.prototype._willBeOverCapacity=function(t){return this._capacity<t},n.prototype._pushOne=function(t){var e=this.length();this._checkCapacity(e+1),this[this._front+e&this._capacity-1]=t,this._length=e+1;},n.prototype.push=function(t,e,r){var n=this.length()+3;if(this._willBeOverCapacity(n))return this._pushOne(t),this._pushOne(e),void this._pushOne(r);var i=this._front+n-3;this._checkCapacity(n);var o=this._capacity-1;this[i+0&o]=t,this[i+1&o]=e,this[i+2&o]=r,this._length=n;},n.prototype.shift=function(){var t=this._front,e=this[t];return this[t]=void 0,this._front=t+1&this._capacity-1,this._length--,e},n.prototype.length=function(){return this._length},n.prototype._checkCapacity=function(t){this._capacity<t&&this._resizeTo(this._capacity<<1);},n.prototype._resizeTo=function(t){var e=this._capacity;this._capacity=t,function(t,e,r,n,i){for(var o=0;o<i;++o)r[o+n]=t[o+0],t[o+0]=void 0;}(this,0,this,e,this._front+this._length&e-1);},e.exports=n;},{}],27:[function(t,e,r){e.exports=function(e,r,n,i){var o=t("./util"),s=function(t){return t.then(function(e){return a(e,t)})};function a(t,a){var u=n(t);if(u instanceof e)return s(u);if(null===(t=o.asArray(t)))return i("expecting an array or an iterable object but got "+o.classString(t));var c=new e(r);void 0!==a&&c._propagateFrom(a,3);for(var l=c._fulfill,f=c._reject,h=0,p=t.length;h<p;++h){var d=t[h];(void 0!==d||h in t)&&e.cast(d)._then(l,f,void 0,c,null);}return c}e.race=function(t){return a(t,void 0)},e.prototype.race=function(){return a(this,void 0)};};},{"./util":36}],28:[function(t,e,r){e.exports=function(e,r,n,i,o,s){var a=e._getDomain,u=t("./util"),c=u.tryCatch;function l(t,r,n,i){this.constructor$(t);var s=a();this._fn=null===s?r:u.domainBind(s,r),void 0!==n&&(n=e.resolve(n))._attachCancellationCallback(this),this._initialValue=n,this._currentCancellable=null,this._eachValues=i===o?Array(this._length):0===i?null:void 0,this._promise._captureStackTrace(),this._init$(void 0,-5);}function f(t,e){this.isFulfilled()?e._resolve(t):e._reject(t);}function h(t,e,r,i){return "function"!=typeof e?n("expecting a function but got "+u.classString(e)):new l(t,e,r,i).promise()}function p(t){this.accum=t,this.array._gotAccum(t);var r=i(this.value,this.array._promise);return r instanceof e?(this.array._currentCancellable=r,r._then(d,void 0,void 0,this,void 0)):d.call(this,r)}function d(t){var r,n=this.array,i=n._promise,o=c(n._fn);i._pushContext(),(r=void 0!==n._eachValues?o.call(i._boundValue(),t,this.index,this.length):o.call(i._boundValue(),this.accum,t,this.index,this.length))instanceof e&&(n._currentCancellable=r);var a=i._popContext();return s.checkForgottenReturns(r,a,void 0!==n._eachValues?"Promise.each":"Promise.reduce",i),r}u.inherits(l,r),l.prototype._gotAccum=function(t){void 0!==this._eachValues&&null!==this._eachValues&&t!==o&&this._eachValues.push(t);},l.prototype._eachComplete=function(t){return null!==this._eachValues&&this._eachValues.push(t),this._eachValues},l.prototype._init=function(){},l.prototype._resolveEmptyArray=function(){this._resolve(void 0!==this._eachValues?this._eachValues:this._initialValue);},l.prototype.shouldCopyValues=function(){return !1},l.prototype._resolve=function(t){this._promise._resolveCallback(t),this._values=null;},l.prototype._resultCancelled=function(t){if(t===this._initialValue)return this._cancel();this._isResolved()||(this._resultCancelled$(),this._currentCancellable instanceof e&&this._currentCancellable.cancel(),this._initialValue instanceof e&&this._initialValue.cancel());},l.prototype._iterate=function(t){var r,n;this._values=t;var i=t.length;if(void 0!==this._initialValue?(r=this._initialValue,n=0):(r=e.resolve(t[0]),n=1),this._currentCancellable=r,!r.isRejected())for(;n<i;++n){var o={accum:null,value:t[n],index:n,length:i,array:this};r=r._then(p,void 0,void 0,o,void 0);}void 0!==this._eachValues&&(r=r._then(this._eachComplete,void 0,void 0,this,void 0)),r._then(f,f,void 0,r,this);},e.prototype.reduce=function(t,e){return h(this,t,e,null)},e.reduce=function(t,e,r,n){return h(t,e,r,n)};};},{"./util":36}],29:[function(t,i,o){var s,a=t("./util"),u=a.getNativePromise();if(a.isNode&&"undefined"==typeof MutationObserver){var c=r.setImmediate,l=e.nextTick;s=a.isRecentNode?function(t){c.call(r,t);}:function(t){l.call(e,t);};}else if("function"==typeof u&&"function"==typeof u.resolve){var f=u.resolve();s=function(t){f.then(t);};}else s="undefined"==typeof MutationObserver||"undefined"!=typeof window&&window.navigator&&(window.navigator.standalone||window.cordova)?void 0!==n?function(t){n(t);}:"undefined"!=typeof setTimeout?function(t){setTimeout(t,0);}:function(){throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n")}:function(){var t=document.createElement("div"),e={attributes:!0},r=!1,n=document.createElement("div");return new MutationObserver(function(){t.classList.toggle("foo"),r=!1;}).observe(n,e),function(i){var o=new MutationObserver(function(){o.disconnect(),i();});o.observe(t,e),r||(r=!0,n.classList.toggle("foo"));}}();i.exports=s;},{"./util":36}],30:[function(t,e,r){e.exports=function(e,r,n){var i=e.PromiseInspection;function o(t){this.constructor$(t);}t("./util").inherits(o,r),o.prototype._promiseResolved=function(t,e){return this._values[t]=e,++this._totalResolved>=this._length&&(this._resolve(this._values),!0)},o.prototype._promiseFulfilled=function(t,e){var r=new i;return r._bitField=33554432,r._settledValueField=t,this._promiseResolved(e,r)},o.prototype._promiseRejected=function(t,e){var r=new i;return r._bitField=16777216,r._settledValueField=t,this._promiseResolved(e,r)},e.settle=function(t){return n.deprecated(".settle()",".reflect()"),new o(t).promise()},e.prototype.settle=function(){return e.settle(this)};};},{"./util":36}],31:[function(t,e,r){e.exports=function(e,r,n){var i=t("./util"),o=t("./errors").RangeError,s=t("./errors").AggregateError,a=i.isArray,u={};function c(t){this.constructor$(t),this._howMany=0,this._unwrap=!1,this._initialized=!1;}function l(t,e){if((0|e)!==e||e<0)return n("expecting a positive integer\n\n    See http://goo.gl/MqrFmX\n");var r=new c(t),i=r.promise();return r.setHowMany(e),r.init(),i}i.inherits(c,r),c.prototype._init=function(){if(this._initialized)if(0!==this._howMany){this._init$(void 0,-5);var t=a(this._values);!this._isResolved()&&t&&this._howMany>this._canPossiblyFulfill()&&this._reject(this._getRangeError(this.length()));}else this._resolve([]);},c.prototype.init=function(){this._initialized=!0,this._init();},c.prototype.setUnwrap=function(){this._unwrap=!0;},c.prototype.howMany=function(){return this._howMany},c.prototype.setHowMany=function(t){this._howMany=t;},c.prototype._promiseFulfilled=function(t){return this._addFulfilled(t),this._fulfilled()===this.howMany()&&(this._values.length=this.howMany(),1===this.howMany()&&this._unwrap?this._resolve(this._values[0]):this._resolve(this._values),!0)},c.prototype._promiseRejected=function(t){return this._addRejected(t),this._checkOutcome()},c.prototype._promiseCancelled=function(){return this._values instanceof e||null==this._values?this._cancel():(this._addRejected(u),this._checkOutcome())},c.prototype._checkOutcome=function(){if(this.howMany()>this._canPossiblyFulfill()){for(var t=new s,e=this.length();e<this._values.length;++e)this._values[e]!==u&&t.push(this._values[e]);return t.length>0?this._reject(t):this._cancel(),!0}return !1},c.prototype._fulfilled=function(){return this._totalResolved},c.prototype._rejected=function(){return this._values.length-this.length()},c.prototype._addRejected=function(t){this._values.push(t);},c.prototype._addFulfilled=function(t){this._values[this._totalResolved++]=t;},c.prototype._canPossiblyFulfill=function(){return this.length()-this._rejected()},c.prototype._getRangeError=function(t){var e="Input array must contain at least "+this._howMany+" items but contains only "+t+" items";return new o(e)},c.prototype._resolveEmptyArray=function(){this._reject(this._getRangeError(0));},e.some=function(t,e){return l(t,e)},e.prototype.some=function(t){return l(this,t)},e._SomePromiseArray=c;};},{"./errors":12,"./util":36}],32:[function(t,e,r){e.exports=function(t){function e(t){void 0!==t?(t=t._target(),this._bitField=t._bitField,this._settledValueField=t._isFateSealed()?t._settledValue():void 0):(this._bitField=0,this._settledValueField=void 0);}e.prototype._settledValue=function(){return this._settledValueField};var r=e.prototype.value=function(){if(!this.isFulfilled())throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\n\n    See http://goo.gl/MqrFmX\n");return this._settledValue()},n=e.prototype.error=e.prototype.reason=function(){if(!this.isRejected())throw new TypeError("cannot get rejection reason of a non-rejected promise\n\n    See http://goo.gl/MqrFmX\n");return this._settledValue()},i=e.prototype.isFulfilled=function(){return 0!=(33554432&this._bitField)},o=e.prototype.isRejected=function(){return 0!=(16777216&this._bitField)},s=e.prototype.isPending=function(){return 0==(50397184&this._bitField)},a=e.prototype.isResolved=function(){return 0!=(50331648&this._bitField)};e.prototype.isCancelled=function(){return 0!=(8454144&this._bitField)},t.prototype.__isCancelled=function(){return 65536==(65536&this._bitField)},t.prototype._isCancelled=function(){return this._target().__isCancelled()},t.prototype.isCancelled=function(){return 0!=(8454144&this._target()._bitField)},t.prototype.isPending=function(){return s.call(this._target())},t.prototype.isRejected=function(){return o.call(this._target())},t.prototype.isFulfilled=function(){return i.call(this._target())},t.prototype.isResolved=function(){return a.call(this._target())},t.prototype.value=function(){return r.call(this._target())},t.prototype.reason=function(){var t=this._target();return t._unsetRejectionIsUnhandled(),n.call(t)},t.prototype._value=function(){return this._settledValue()},t.prototype._reason=function(){return this._unsetRejectionIsUnhandled(),this._settledValue()},t.PromiseInspection=e;};},{}],33:[function(t,e,r){e.exports=function(e,r){var n=t("./util"),i=n.errorObj,o=n.isObject,s={}.hasOwnProperty;return function(t,a){if(o(t)){if(t instanceof e)return t;var u=function(t){try{return function(t){return t.then}(t)}catch(t){return i.e=t,i}}(t);if(u===i){a&&a._pushContext();var c=e.reject(u.e);return a&&a._popContext(),c}if("function"==typeof u)return function(t){try{return s.call(t,"_promise0")}catch(t){return !1}}(t)?(c=new e(r),t._then(c._fulfill,c._reject,void 0,c,null),c):function(t,o,s){var a=new e(r),u=a;s&&s._pushContext(),a._captureStackTrace(),s&&s._popContext();var c=!0,l=n.tryCatch(o).call(t,function(t){a&&(a._resolveCallback(t),a=null);},function(t){a&&(a._rejectCallback(t,c,!0),a=null);});return c=!1,a&&l===i&&(a._rejectCallback(l.e,!0,!0),a=null),u}(t,u,a)}return t}};},{"./util":36}],34:[function(t,e,r){e.exports=function(e,r,n){var i=t("./util"),o=e.TimeoutError;function s(t){this.handle=t;}s.prototype._resultCancelled=function(){clearTimeout(this.handle);};var a=function(t){return u(+this).thenReturn(t)},u=e.delay=function(t,i){var o,u;return void 0!==i?(o=e.resolve(i)._then(a,null,null,t,void 0),n.cancellation()&&i instanceof e&&o._setOnCancel(i)):(o=new e(r),u=setTimeout(function(){o._fulfill();},+t),n.cancellation()&&o._setOnCancel(new s(u)),o._captureStackTrace()),o._setAsyncGuaranteed(),o};function c(t){return clearTimeout(this.handle),t}function l(t){throw clearTimeout(this.handle),t}e.prototype.delay=function(t){return u(t,this)},e.prototype.timeout=function(t,e){var r,a;t=+t;var u=new s(setTimeout(function(){r.isPending()&&function(t,e,r){var n;n="string"!=typeof e?e instanceof Error?e:new o("operation timed out"):new o(e),i.markAsOriginatingFromRejection(n),t._attachExtraTrace(n),t._reject(n),null!=r&&r.cancel();}(r,e,a);},t));return n.cancellation()?(a=this.then(),(r=a._then(c,l,void 0,u,void 0))._setOnCancel(u)):r=this._then(c,l,void 0,u,void 0),r};};},{"./util":36}],35:[function(t,e,r){e.exports=function(e,r,n,i,o,s){var a=t("./util"),u=t("./errors").TypeError,c=t("./util").inherits,l=a.errorObj,f=a.tryCatch,h={};function p(t){setTimeout(function(){throw t},0);}function d(t,r){var i=0,s=t.length,a=new e(o);return function o(){if(i>=s)return a._fulfill();var u=function(t){var e=n(t);return e!==t&&"function"==typeof t._isDisposable&&"function"==typeof t._getDisposer&&t._isDisposable()&&e._setDisposable(t._getDisposer()),e}(t[i++]);if(u instanceof e&&u._isDisposable()){try{u=n(u._getDisposer().tryDispose(r),t.promise);}catch(t){return p(t)}if(u instanceof e)return u._then(o,p,null,null,null)}o();}(),a}function _(t,e,r){this._data=t,this._promise=e,this._context=r;}function v(t,e,r){this.constructor$(t,e,r);}function y(t){return _.isDisposer(t)?(this.resources[this.index]._setDisposable(t),t.promise()):t}function m(t){this.length=t,this.promise=null,this[t-1]=null;}_.prototype.data=function(){return this._data},_.prototype.promise=function(){return this._promise},_.prototype.resource=function(){return this.promise().isFulfilled()?this.promise().value():h},_.prototype.tryDispose=function(t){var e=this.resource(),r=this._context;void 0!==r&&r._pushContext();var n=e!==h?this.doDispose(e,t):null;return void 0!==r&&r._popContext(),this._promise._unsetDisposable(),this._data=null,n},_.isDisposer=function(t){return null!=t&&"function"==typeof t.resource&&"function"==typeof t.tryDispose},c(v,_),v.prototype.doDispose=function(t,e){return this.data().call(t,t,e)},m.prototype._resultCancelled=function(){for(var t=this.length,r=0;r<t;++r){var n=this[r];n instanceof e&&n.cancel();}},e.using=function(){var t=arguments.length;if(t<2)return r("you must pass at least 2 arguments to Promise.using");var i,o=arguments[t-1];if("function"!=typeof o)return r("expecting a function but got "+a.classString(o));var u=!0;2===t&&Array.isArray(arguments[0])?(t=(i=arguments[0]).length,u=!1):(i=arguments,t--);for(var c=new m(t),h=0;h<t;++h){var p=i[h];if(_.isDisposer(p)){var v=p;(p=p.promise())._setDisposable(v);}else {var g=n(p);g instanceof e&&(p=g._then(y,null,null,{resources:c,index:h},void 0));}c[h]=p;}var b=new Array(c.length);for(h=0;h<b.length;++h)b[h]=e.resolve(c[h]).reflect();var w=e.all(b).then(function(t){for(var e=0;e<t.length;++e){var r=t[e];if(r.isRejected())return l.e=r.error(),l;if(!r.isFulfilled())return void w.cancel();t[e]=r.value();}E._pushContext(),o=f(o);var n=u?o.apply(void 0,t):o(t),i=E._popContext();return s.checkForgottenReturns(n,i,"Promise.using",E),n}),E=w.lastly(function(){var t=new e.PromiseInspection(w);return d(c,t)});return c.promise=E,E._setOnCancel(c),E},e.prototype._setDisposable=function(t){this._bitField=131072|this._bitField,this._disposer=t;},e.prototype._isDisposable=function(){return (131072&this._bitField)>0},e.prototype._getDisposer=function(){return this._disposer},e.prototype._unsetDisposable=function(){this._bitField=-131073&this._bitField,this._disposer=void 0;},e.prototype.disposer=function(t){if("function"==typeof t)return new v(t,this,i());throw new u};};},{"./errors":12,"./util":36}],36:[function(t,n,i){var o,s=t("./es5"),a="undefined"==typeof navigator,u={e:{}},c="undefined"!=typeof self?self:"undefined"!=typeof window?window:void 0!==r?r:void 0!==this?this:null;function l(){try{var t=o;return o=null,t.apply(this,arguments)}catch(t){return u.e=t,u}}function f(t){return null==t||!0===t||!1===t||"string"==typeof t||"number"==typeof t}function h(t,e,r){if(f(t))return t;var n={value:r,configurable:!0,enumerable:!1,writable:!0};return s.defineProperty(t,e,n),t}var p=function(){var t=[Array.prototype,Object.prototype,Function.prototype],e=function(e){for(var r=0;r<t.length;++r)if(t[r]===e)return !0;return !1};if(s.isES5){var r=Object.getOwnPropertyNames;return function(t){for(var n=[],i=Object.create(null);null!=t&&!e(t);){var o;try{o=r(t);}catch(t){return n}for(var a=0;a<o.length;++a){var u=o[a];if(!i[u]){i[u]=!0;var c=Object.getOwnPropertyDescriptor(t,u);null!=c&&null==c.get&&null==c.set&&n.push(u);}}t=s.getPrototypeOf(t);}return n}}var n={}.hasOwnProperty;return function(r){if(e(r))return [];var i=[];t:for(var o in r)if(n.call(r,o))i.push(o);else {for(var s=0;s<t.length;++s)if(n.call(t[s],o))continue t;i.push(o);}return i}}(),d=/this\s*\.\s*\S+\s*=/,_=/^[a-z$_][a-z$_0-9]*$/i;function v(t){try{return t+""}catch(t){return "[no string representation]"}}function y(t){return t instanceof Error||null!==t&&"object"==typeof t&&"string"==typeof t.message&&"string"==typeof t.name}function m(t){return y(t)&&s.propertyIsWritable(t,"stack")}var g="stack"in new Error?function(t){return m(t)?t:new Error(v(t))}:function(t){if(m(t))return t;try{throw new Error(v(t))}catch(t){return t}};function b(t){return {}.toString.call(t)}var w=function(t){return s.isArray(t)?t:null};if("undefined"!=typeof Symbol&&Symbol.iterator){var E="function"==typeof Array.from?function(t){return Array.from(t)}:function(t){for(var e,r=[],n=t[Symbol.iterator]();!(e=n.next()).done;)r.push(e.value);return r};w=function(t){return s.isArray(t)?t:null!=t&&"function"==typeof t[Symbol.iterator]?E(t):null};}var C=void 0!==e&&"[object process]"===b(e).toLowerCase(),x=void 0!==e&&void 0!==e.env,j={isClass:function(t){try{if("function"==typeof t){var e=s.names(t.prototype),r=s.isES5&&e.length>1,n=e.length>0&&!(1===e.length&&"constructor"===e[0]),i=d.test(t+"")&&s.names(t).length>0;if(r||n||i)return !0}return !1}catch(t){return !1}},isIdentifier:function(t){return _.test(t)},inheritedDataKeys:p,getDataPropertyOrDefault:function(t,e,r){if(!s.isES5)return {}.hasOwnProperty.call(t,e)?t[e]:void 0;var n=Object.getOwnPropertyDescriptor(t,e);return null!=n?null==n.get&&null==n.set?n.value:r:void 0},thrower:function(t){throw t},isArray:s.isArray,asArray:w,notEnumerableProp:h,isPrimitive:f,isObject:function(t){return "function"==typeof t||"object"==typeof t&&null!==t},isError:y,canEvaluate:a,errorObj:u,tryCatch:function(t){return o=t,l},inherits:function(t,e){var r={}.hasOwnProperty;function n(){for(var n in this.constructor=t,this.constructor$=e,e.prototype)r.call(e.prototype,n)&&"$"!==n.charAt(n.length-1)&&(this[n+"$"]=e.prototype[n]);}return n.prototype=e.prototype,t.prototype=new n,t.prototype},withAppended:function(t,e){var r,n=t.length,i=new Array(n+1);for(r=0;r<n;++r)i[r]=t[r];return i[r]=e,i},maybeWrapAsError:function(t){return f(t)?new Error(v(t)):t},toFastProperties:function(t){return t},filledRange:function(t,e,r){for(var n=new Array(t),i=0;i<t;++i)n[i]=e+i+r;return n},toString:v,canAttachTrace:m,ensureErrorObject:g,originatesFromRejection:function(t){return null!=t&&(t instanceof Error.__BluebirdErrorTypes__.OperationalError||!0===t.isOperational)},markAsOriginatingFromRejection:function(t){try{h(t,"isOperational",!0);}catch(t){}},classString:b,copyDescriptors:function(t,e,r){for(var n=s.names(t),i=0;i<n.length;++i){var o=n[i];if(r(o))try{s.defineProperty(e,o,s.getDescriptor(t,o));}catch(t){}}},hasDevTools:"undefined"!=typeof chrome&&chrome&&"function"==typeof chrome.loadTimes,isNode:C,hasEnvVariables:x,env:function(t){return x?e.env[t]:void 0},global:c,getNativePromise:function(){if("function"==typeof Promise)try{var t=new Promise(function(){});if("[object Promise]"==={}.toString.call(t))return Promise}catch(t){}},domainBind:function(t,e){return t.bind(e)}};j.isRecentNode=j.isNode&&function(){var t=e.versions.node.split(".").map(Number);return 0===t[0]&&t[1]>10||t[0]>0}(),j.isNode&&j.toFastProperties(e);try{throw new Error}catch(t){j.lastLineError=t;}n.exports=j;},{"./es5":13}]},{},[4])(4),"undefined"!=typeof window&&null!==window?window.P=window.Promise:"undefined"!=typeof self&&null!==self&&(self.P=self.Promise);}).call(this,r(4),r(0),r(11).setImmediate);},function(t,e,r){Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t,e){if(!e.eol&&t)for(var r=0,n=t.length;r<n;r++)if("\r"===t[r]){if("\n"===t[r+1]){e.eol="\r\n";break}if(t[r+1]){e.eol="\r";break}}else if("\n"===t[r]){e.eol="\n";break}return e.eol||"\n"};},function(t,e,r){var n=r(65),i=r(73);t.exports=function(t,e){var r=i(t,e);return n(r)?r:void 0};},function(t,e,r){var n=r(19).Symbol;t.exports=n;},function(t,e,r){var n=r(67),i="object"==typeof self&&self&&self.Object===Object&&self,o=n||i||Function("return this")();t.exports=o;},function(t,e){t.exports=function(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)};},function(t,e){var r=Array.isArray;t.exports=r;},function(t,e,r){var n=r(30),i=r(76);t.exports=function(t){return "symbol"==typeof t||i(t)&&"[object Symbol]"==n(t)};},function(t,e,r){(function(e,n){var i=r(6);t.exports=g;var o,s=r(37);g.ReadableState=m,r(12).EventEmitter;var a=function(t,e){return t.listeners(e).length},u=r(24),c=r(7).Buffer,l=e.Uint8Array||function(){},f=r(5);f.inherits=r(2);var h=r(41),p=void 0;p=h&&h.debuglog?h.debuglog("stream"):function(){};var d,_=r(42),v=r(25);f.inherits(g,u);var y=["error","close","destroy","pause","resume"];function m(t,e){o=o||r(1),t=t||{};var n=e instanceof o;this.objectMode=!!t.objectMode,n&&(this.objectMode=this.objectMode||!!t.readableObjectMode);var i=t.highWaterMark,s=t.readableHighWaterMark,a=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(s||0===s)?s:a,this.highWaterMark=Math.floor(this.highWaterMark),this.buffer=new _,this.length=0,this.pipes=null,this.pipesCount=0,this.flowing=null,this.ended=!1,this.endEmitted=!1,this.reading=!1,this.sync=!0,this.needReadable=!1,this.emittedReadable=!1,this.readableListening=!1,this.resumeScheduled=!1,this.destroyed=!1,this.defaultEncoding=t.defaultEncoding||"utf8",this.awaitDrain=0,this.readingMore=!1,this.decoder=null,this.encoding=null,t.encoding&&(d||(d=r(26).StringDecoder),this.decoder=new d(t.encoding),this.encoding=t.encoding);}function g(t){if(o=o||r(1),!(this instanceof g))return new g(t);this._readableState=new m(t,this),this.readable=!0,t&&("function"==typeof t.read&&(this._read=t.read),"function"==typeof t.destroy&&(this._destroy=t.destroy)),u.call(this);}function b(t,e,r,n,i){var o,s=t._readableState;return null===e?(s.reading=!1,function(t,e){if(!e.ended){if(e.decoder){var r=e.decoder.end();r&&r.length&&(e.buffer.push(r),e.length+=e.objectMode?1:r.length);}e.ended=!0,x(t);}}(t,s)):(i||(o=function(t,e){var r;return function(t){return c.isBuffer(t)||t instanceof l}(e)||"string"==typeof e||void 0===e||t.objectMode||(r=new TypeError("Invalid non-string/buffer chunk")),r}(s,e)),o?t.emit("error",o):s.objectMode||e&&e.length>0?("string"==typeof e||s.objectMode||Object.getPrototypeOf(e)===c.prototype||(e=function(t){return c.from(t)}(e)),n?s.endEmitted?t.emit("error",new Error("stream.unshift() after end event")):w(t,s,e,!0):s.ended?t.emit("error",new Error("stream.push() after EOF")):(s.reading=!1,s.decoder&&!r?(e=s.decoder.write(e),s.objectMode||0!==e.length?w(t,s,e,!1):S(t,s)):w(t,s,e,!1))):n||(s.reading=!1)),function(t){return !t.ended&&(t.needReadable||t.length<t.highWaterMark||0===t.length)}(s)}function w(t,e,r,n){e.flowing&&0===e.length&&!e.sync?(t.emit("data",r),t.read(0)):(e.length+=e.objectMode?1:r.length,n?e.buffer.unshift(r):e.buffer.push(r),e.needReadable&&x(t)),S(t,e);}Object.defineProperty(g.prototype,"destroyed",{get:function(){return void 0!==this._readableState&&this._readableState.destroyed},set:function(t){this._readableState&&(this._readableState.destroyed=t);}}),g.prototype.destroy=v.destroy,g.prototype._undestroy=v.undestroy,g.prototype._destroy=function(t,e){this.push(null),e(t);},g.prototype.push=function(t,e){var r,n=this._readableState;return n.objectMode?r=!0:"string"==typeof t&&((e=e||n.defaultEncoding)!==n.encoding&&(t=c.from(t,e),e=""),r=!0),b(this,t,e,!1,r)},g.prototype.unshift=function(t){return b(this,t,null,!0,!1)},g.prototype.isPaused=function(){return !1===this._readableState.flowing},g.prototype.setEncoding=function(t){return d||(d=r(26).StringDecoder),this._readableState.decoder=new d(t),this._readableState.encoding=t,this};var E=8388608;function C(t,e){return t<=0||0===e.length&&e.ended?0:e.objectMode?1:t!=t?e.flowing&&e.length?e.buffer.head.data.length:e.length:(t>e.highWaterMark&&(e.highWaterMark=function(t){return t>=E?t=E:(t--,t|=t>>>1,t|=t>>>2,t|=t>>>4,t|=t>>>8,t|=t>>>16,t++),t}(t)),t<=e.length?t:e.ended?e.length:(e.needReadable=!0,0))}function x(t){var e=t._readableState;e.needReadable=!1,e.emittedReadable||(p("emitReadable",e.flowing),e.emittedReadable=!0,e.sync?i.nextTick(j,t):j(t));}function j(t){p("emit readable"),t.emit("readable"),P(t);}function S(t,e){e.readingMore||(e.readingMore=!0,i.nextTick(R,t,e));}function R(t,e){for(var r=e.length;!e.reading&&!e.flowing&&!e.ended&&e.length<e.highWaterMark&&(p("maybeReadMore read 0"),t.read(0),r!==e.length);)r=e.length;e.readingMore=!1;}function k(t){p("readable nexttick read 0"),t.read(0);}function T(t,e){e.reading||(p("resume read 0"),t.read(0)),e.resumeScheduled=!1,e.awaitDrain=0,t.emit("resume"),P(t),e.flowing&&!e.reading&&t.read(0);}function P(t){var e=t._readableState;for(p("flow",e.flowing);e.flowing&&null!==t.read(););}function O(t,e){return 0===e.length?null:(e.objectMode?r=e.buffer.shift():!t||t>=e.length?(r=e.decoder?e.buffer.join(""):1===e.buffer.length?e.buffer.head.data:e.buffer.concat(e.length),e.buffer.clear()):r=function(t,e,r){var n;return t<e.head.data.length?(n=e.head.data.slice(0,t),e.head.data=e.head.data.slice(t)):n=t===e.head.data.length?e.shift():r?function(t,e){var r=e.head,n=1,i=r.data;for(t-=i.length;r=r.next;){var o=r.data,s=t>o.length?o.length:t;if(s===o.length?i+=o:i+=o.slice(0,t),0==(t-=s)){s===o.length?(++n,r.next?e.head=r.next:e.head=e.tail=null):(e.head=r,r.data=o.slice(s));break}++n;}return e.length-=n,i}(t,e):function(t,e){var r=c.allocUnsafe(t),n=e.head,i=1;for(n.data.copy(r),t-=n.data.length;n=n.next;){var o=n.data,s=t>o.length?o.length:t;if(o.copy(r,r.length-t,0,s),0==(t-=s)){s===o.length?(++i,n.next?e.head=n.next:e.head=e.tail=null):(e.head=n,n.data=o.slice(s));break}++i;}return e.length-=i,r}(t,e),n}(t,e.buffer,e.decoder),r);var r;}function A(t){var e=t._readableState;if(e.length>0)throw new Error('"endReadable()" called on non-empty stream');e.endEmitted||(e.ended=!0,i.nextTick(F,e,t));}function F(t,e){t.endEmitted||0!==t.length||(t.endEmitted=!0,e.readable=!1,e.emit("end"));}function L(t,e){for(var r=0,n=t.length;r<n;r++)if(t[r]===e)return r;return -1}g.prototype.read=function(t){p("read",t),t=parseInt(t,10);var e=this._readableState,r=t;if(0!==t&&(e.emittedReadable=!1),0===t&&e.needReadable&&(e.length>=e.highWaterMark||e.ended))return p("read: emitReadable",e.length,e.ended),0===e.length&&e.ended?A(this):x(this),null;if(0===(t=C(t,e))&&e.ended)return 0===e.length&&A(this),null;var n,i=e.needReadable;return p("need readable",i),(0===e.length||e.length-t<e.highWaterMark)&&p("length less than watermark",i=!0),e.ended||e.reading?p("reading or ended",i=!1):i&&(p("do read"),e.reading=!0,e.sync=!0,0===e.length&&(e.needReadable=!0),this._read(e.highWaterMark),e.sync=!1,e.reading||(t=C(r,e))),null===(n=t>0?O(t,e):null)?(e.needReadable=!0,t=0):e.length-=t,0===e.length&&(e.ended||(e.needReadable=!0),r!==t&&e.ended&&A(this)),null!==n&&this.emit("data",n),n},g.prototype._read=function(t){this.emit("error",new Error("_read() is not implemented"));},g.prototype.pipe=function(t,e){var r=this,o=this._readableState;switch(o.pipesCount){case 0:o.pipes=t;break;case 1:o.pipes=[o.pipes,t];break;default:o.pipes.push(t);}o.pipesCount+=1,p("pipe count=%d opts=%j",o.pipesCount,e);var u=e&&!1===e.end||t===n.stdout||t===n.stderr?m:c;function c(){p("onend"),t.end();}o.endEmitted?i.nextTick(u):r.once("end",u),t.on("unpipe",function e(n,i){p("onunpipe"),n===r&&i&&!1===i.hasUnpiped&&(i.hasUnpiped=!0,p("cleanup"),t.removeListener("close",v),t.removeListener("finish",y),t.removeListener("drain",l),t.removeListener("error",_),t.removeListener("unpipe",e),r.removeListener("end",c),r.removeListener("end",m),r.removeListener("data",d),f=!0,!o.awaitDrain||t._writableState&&!t._writableState.needDrain||l());});var l=function(t){return function(){var e=t._readableState;p("pipeOnDrain",e.awaitDrain),e.awaitDrain&&e.awaitDrain--,0===e.awaitDrain&&a(t,"data")&&(e.flowing=!0,P(t));}}(r);t.on("drain",l);var f=!1,h=!1;function d(e){p("ondata"),h=!1,!1!==t.write(e)||h||((1===o.pipesCount&&o.pipes===t||o.pipesCount>1&&-1!==L(o.pipes,t))&&!f&&(p("false write response, pause",r._readableState.awaitDrain),r._readableState.awaitDrain++,h=!0),r.pause());}function _(e){p("onerror",e),m(),t.removeListener("error",_),0===a(t,"error")&&t.emit("error",e);}function v(){t.removeListener("finish",y),m();}function y(){p("onfinish"),t.removeListener("close",v),m();}function m(){p("unpipe"),r.unpipe(t);}return r.on("data",d),function(t,e,r){if("function"==typeof t.prependListener)return t.prependListener(e,r);t._events&&t._events[e]?s(t._events[e])?t._events[e].unshift(r):t._events[e]=[r,t._events[e]]:t.on(e,r);}(t,"error",_),t.once("close",v),t.once("finish",y),t.emit("pipe",r),o.flowing||(p("pipe resume"),r.resume()),t},g.prototype.unpipe=function(t){var e=this._readableState,r={hasUnpiped:!1};if(0===e.pipesCount)return this;if(1===e.pipesCount)return t&&t!==e.pipes?this:(t||(t=e.pipes),e.pipes=null,e.pipesCount=0,e.flowing=!1,t&&t.emit("unpipe",this,r),this);if(!t){var n=e.pipes,i=e.pipesCount;e.pipes=null,e.pipesCount=0,e.flowing=!1;for(var o=0;o<i;o++)n[o].emit("unpipe",this,r);return this}var s=L(e.pipes,t);return -1===s?this:(e.pipes.splice(s,1),e.pipesCount-=1,1===e.pipesCount&&(e.pipes=e.pipes[0]),t.emit("unpipe",this,r),this)},g.prototype.on=function(t,e){var r=u.prototype.on.call(this,t,e);if("data"===t)!1!==this._readableState.flowing&&this.resume();else if("readable"===t){var n=this._readableState;n.endEmitted||n.readableListening||(n.readableListening=n.needReadable=!0,n.emittedReadable=!1,n.reading?n.length&&x(this):i.nextTick(k,this));}return r},g.prototype.addListener=g.prototype.on,g.prototype.resume=function(){var t=this._readableState;return t.flowing||(p("resume"),t.flowing=!0,function(t,e){e.resumeScheduled||(e.resumeScheduled=!0,i.nextTick(T,t,e));}(this,t)),this},g.prototype.pause=function(){return p("call pause flowing=%j",this._readableState.flowing),!1!==this._readableState.flowing&&(p("pause"),this._readableState.flowing=!1,this.emit("pause")),this},g.prototype.wrap=function(t){var e=this,r=this._readableState,n=!1;for(var i in t.on("end",function(){if(p("wrapped end"),r.decoder&&!r.ended){var t=r.decoder.end();t&&t.length&&e.push(t);}e.push(null);}),t.on("data",function(i){p("wrapped data"),r.decoder&&(i=r.decoder.write(i)),(!r.objectMode||null!==i&&void 0!==i)&&(r.objectMode||i&&i.length)&&(e.push(i)||(n=!0,t.pause()));}),t)void 0===this[i]&&"function"==typeof t[i]&&(this[i]=function(e){return function(){return t[e].apply(t,arguments)}}(i));for(var o=0;o<y.length;o++)t.on(y[o],this.emit.bind(this,y[o]));return this._read=function(e){p("wrapped _read",e),n&&(n=!1,t.resume());},this},Object.defineProperty(g.prototype,"readableHighWaterMark",{enumerable:!1,get:function(){return this._readableState.highWaterMark}}),g._fromList=O;}).call(this,r(0),r(4));},function(t,e,r){t.exports=r(12).EventEmitter;},function(t,e,r){var n=r(6);function i(t,e){t.emit("error",e);}t.exports={destroy:function(t,e){var r=this,o=this._readableState&&this._readableState.destroyed,s=this._writableState&&this._writableState.destroyed;return o||s?(e?e(t):!t||this._writableState&&this._writableState.errorEmitted||n.nextTick(i,this,t),this):(this._readableState&&(this._readableState.destroyed=!0),this._writableState&&(this._writableState.destroyed=!0),this._destroy(t||null,function(t){!e&&t?(n.nextTick(i,r,t),r._writableState&&(r._writableState.errorEmitted=!0)):e&&e(t);}),this)},undestroy:function(){this._readableState&&(this._readableState.destroyed=!1,this._readableState.reading=!1,this._readableState.ended=!1,this._readableState.endEmitted=!1),this._writableState&&(this._writableState.destroyed=!1,this._writableState.ended=!1,this._writableState.ending=!1,this._writableState.finished=!1,this._writableState.errorEmitted=!1);}};},function(t,e,r){var n=r(7).Buffer,i=n.isEncoding||function(t){switch((t=""+t)&&t.toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":case"raw":return !0;default:return !1}};function o(t){var e;switch(this.encoding=function(t){var e=function(t){if(!t)return "utf8";for(var e;;)switch(t){case"utf8":case"utf-8":return "utf8";case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return "utf16le";case"latin1":case"binary":return "latin1";case"base64":case"ascii":case"hex":return t;default:if(e)return;t=(""+t).toLowerCase(),e=!0;}}(t);if("string"!=typeof e&&(n.isEncoding===i||!i(t)))throw new Error("Unknown encoding: "+t);return e||t}(t),this.encoding){case"utf16le":this.text=u,this.end=c,e=4;break;case"utf8":this.fillLast=a,e=4;break;case"base64":this.text=l,this.end=f,e=3;break;default:return this.write=h,void(this.end=p)}this.lastNeed=0,this.lastTotal=0,this.lastChar=n.allocUnsafe(e);}function s(t){return t<=127?0:t>>5==6?2:t>>4==14?3:t>>3==30?4:t>>6==2?-1:-2}function a(t){var e=this.lastTotal-this.lastNeed,r=function(t,e,r){if(128!=(192&e[0]))return t.lastNeed=0,"�";if(t.lastNeed>1&&e.length>1){if(128!=(192&e[1]))return t.lastNeed=1,"�";if(t.lastNeed>2&&e.length>2&&128!=(192&e[2]))return t.lastNeed=2,"�"}}(this,t);return void 0!==r?r:this.lastNeed<=t.length?(t.copy(this.lastChar,e,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal)):(t.copy(this.lastChar,e,0,t.length),void(this.lastNeed-=t.length))}function u(t,e){if((t.length-e)%2==0){var r=t.toString("utf16le",e);if(r){var n=r.charCodeAt(r.length-1);if(n>=55296&&n<=56319)return this.lastNeed=2,this.lastTotal=4,this.lastChar[0]=t[t.length-2],this.lastChar[1]=t[t.length-1],r.slice(0,-1)}return r}return this.lastNeed=1,this.lastTotal=2,this.lastChar[0]=t[t.length-1],t.toString("utf16le",e,t.length-1)}function c(t){var e=t&&t.length?this.write(t):"";if(this.lastNeed){var r=this.lastTotal-this.lastNeed;return e+this.lastChar.toString("utf16le",0,r)}return e}function l(t,e){var r=(t.length-e)%3;return 0===r?t.toString("base64",e):(this.lastNeed=3-r,this.lastTotal=3,1===r?this.lastChar[0]=t[t.length-1]:(this.lastChar[0]=t[t.length-2],this.lastChar[1]=t[t.length-1]),t.toString("base64",e,t.length-r))}function f(t){var e=t&&t.length?this.write(t):"";return this.lastNeed?e+this.lastChar.toString("base64",0,3-this.lastNeed):e}function h(t){return t.toString(this.encoding)}function p(t){return t&&t.length?this.write(t):""}e.StringDecoder=o,o.prototype.write=function(t){if(0===t.length)return "";var e,r;if(this.lastNeed){if(void 0===(e=this.fillLast(t)))return "";r=this.lastNeed,this.lastNeed=0;}else r=0;return r<t.length?e?e+this.text(t,r):this.text(t,r):e||""},o.prototype.end=function(t){var e=t&&t.length?this.write(t):"";return this.lastNeed?e+"�":e},o.prototype.text=function(t,e){var r=function(t,e,r){var n=e.length-1;if(n<r)return 0;var i=s(e[n]);return i>=0?(i>0&&(t.lastNeed=i-1),i):--n<r||-2===i?0:(i=s(e[n]))>=0?(i>0&&(t.lastNeed=i-2),i):--n<r||-2===i?0:(i=s(e[n]))>=0?(i>0&&(2===i?i=0:t.lastNeed=i-3),i):0}(this,t,e);if(!this.lastNeed)return t.toString("utf8",e);this.lastTotal=r;var n=t.length-(r-this.lastNeed);return t.copy(this.lastChar,0,n),t.toString("utf8",e,n)},o.prototype.fillLast=function(t){if(this.lastNeed<=t.length)return t.copy(this.lastChar,this.lastTotal-this.lastNeed,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal);t.copy(this.lastChar,this.lastTotal-this.lastNeed,0,t.length),this.lastNeed-=t.length;};},function(t,e,r){t.exports=o;var n=r(1),i=r(5);function o(t){if(!(this instanceof o))return new o(t);n.call(this,t),this._transformState={afterTransform:function(t,e){var r=this._transformState;r.transforming=!1;var n=r.writecb;if(!n)return this.emit("error",new Error("write callback called multiple times"));r.writechunk=null,r.writecb=null,null!=e&&this.push(e),n(t);var i=this._readableState;i.reading=!1,(i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark);}.bind(this),needTransform:!1,transforming:!1,writecb:null,writechunk:null,writeencoding:null},this._readableState.needReadable=!0,this._readableState.sync=!1,t&&("function"==typeof t.transform&&(this._transform=t.transform),"function"==typeof t.flush&&(this._flush=t.flush)),this.on("prefinish",s);}function s(){var t=this;"function"==typeof this._flush?this._flush(function(e,r){a(t,e,r);}):a(this,null,null);}function a(t,e,r){if(e)return t.emit("error",e);if(null!=r&&t.push(r),t._writableState.length)throw new Error("Calling transform done when ws.length != 0");if(t._transformState.transforming)throw new Error("Calling transform done when still transforming");return t.push(null)}i.inherits=r(2),i.inherits(o,n),o.prototype.push=function(t,e){return this._transformState.needTransform=!1,n.prototype.push.call(this,t,e)},o.prototype._transform=function(t,e,r){throw new Error("_transform() is not implemented")},o.prototype._write=function(t,e,r){var n=this._transformState;if(n.writecb=r,n.writechunk=t,n.writeencoding=e,!n.transforming){var i=this._readableState;(n.needTransform||i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark);}},o.prototype._read=function(t){var e=this._transformState;null!==e.writechunk&&e.writecb&&!e.transforming?(e.transforming=!0,this._transform(e.writechunk,e.writeencoding,e.afterTransform)):e.needTransform=!0;},o.prototype._destroy=function(t,e){var r=this;n.prototype._destroy.call(this,t,function(t){e(t),r.emit("close");});};},function(t,e,r){(function(t){Object.defineProperty(e,"__esModule",{value:!0}),e.bufFromString=function(e){var r=t.byteLength(e),n=t.allocUnsafe?t.allocUnsafe(r):new t(r);return n.write(e),n},e.emptyBuffer=function(){return t.allocUnsafe?t.allocUnsafe(0):new t(0)},e.filterArray=function(t,e){for(var r=[],n=0;n<t.length;n++)e.indexOf(n)>-1&&r.push(t[n]);return r},e.trimLeft=String.prototype.trimLeft?function(t){return t.trimLeft()}:function(t){return t.replace(/^\s+/,"")},e.trimRight=String.prototype.trimRight?function(t){return t.trimRight()}:function(t){return t.replace(/\s+$/,"")};}).call(this,r(3).Buffer);},function(t,e,r){var n=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e;}||function(t,e){for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);};return function(e,r){function n(){this.constructor=e;}t(e,r),e.prototype=null===r?Object.create(r):(n.prototype=r.prototype,new n);}}();Object.defineProperty(e,"__esModule",{value:!0});var i=function(t){function e(e,r,n){var i=t.call(this,"Error: "+e+". JSON Line number: "+r+(n?" near: "+n:""))||this;return i.err=e,i.line=r,i.extra=n,i.name="CSV Parse Error",i}return n(e,t),e.column_mismatched=function(t,r){return new e("column_mismatched",t,r)},e.unclosed_quote=function(t,r){return new e("unclosed_quote",t,r)},e.fromJSON=function(t){return new e(t.err,t.line,t.extra)},e.prototype.toJSON=function(){return {err:this.err,line:this.line,extra:this.extra}},e}(Error);e.default=i;},function(t,e,r){var n=r(18),i=r(68),o=r(69),s=n?n.toStringTag:void 0;t.exports=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":s&&s in Object(t)?i(t):o(t)};},function(t,e){t.exports=function(t,e){return t===e||t!=t&&e!=e};},function(t,e,r){t.exports=r(33);},function(t,e,r){var n=r(34),i=function(t,e){return new n.Converter(t,e)};i.csv=i,i.Converter=n.Converter,t.exports=i;},function(t,e,r){(function(t){var n=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e;}||function(t,e){for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);};return function(e,r){function n(){this.constructor=e;}t(e,r),e.prototype=null===r?Object.create(r):(n.prototype=r.prototype,new n);}}(),i=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});var o=r(36),s=r(50),a=r(51),u=i(r(15)),c=r(52),l=r(105),f=function(e){function i(r,n){void 0===n&&(n={});var i=e.call(this,n)||this;return i.options=n,i.params=s.mergeParams(r),i.runtime=a.initParseRuntime(i),i.result=new l.Result(i),i.processor=new c.ProcessorLocal(i),i.once("error",function(e){t(function(){i.result.processError(e),i.emit("done",e);});}),i.once("done",function(){i.processor.destroy();}),i}return n(i,e),i.prototype.preRawData=function(t){return this.runtime.preRawDataHook=t,this},i.prototype.preFileLine=function(t){return this.runtime.preFileLineHook=t,this},i.prototype.subscribe=function(t,e,r){return this.parseRuntime.subscribe={onNext:t,onError:e,onCompleted:r},this},i.prototype.fromFile=function(t,e){var n=this,i=r(!function(){var t=new Error("Cannot find module 'fs'");throw t.code="MODULE_NOT_FOUND",t}());return i.exists(t,function(r){r?i.createReadStream(t,e).pipe(n):n.emit("error",new Error("File does not exist. Check to make sure the file path to your csv is correct."));}),this},i.prototype.fromStream=function(t){return t.pipe(this),this},i.prototype.fromString=function(t){t.toString();var e=new o.Readable,r=0;return e._read=function(e){if(r>=t.length)this.push(null);else {var n=t.substr(r,e);this.push(n),r+=e;}},this.fromStream(e)},i.prototype.then=function(t,e){var r=this;return new u.default(function(n,i){r.parseRuntime.then={onfulfilled:function(e){n(t?t(e):e);},onrejected:function(t){e?n(e(t)):i(t);}};})},Object.defineProperty(i.prototype,"parseParam",{get:function(){return this.params},enumerable:!0,configurable:!0}),Object.defineProperty(i.prototype,"parseRuntime",{get:function(){return this.runtime},enumerable:!0,configurable:!0}),i.prototype._transform=function(t,e,r){var n=this;this.processor.process(t).then(function(t){if(t.length>0)return n.runtime.started=!0,n.result.processResult(t)}).then(function(){n.emit("drained"),r();},function(t){n.runtime.hasError=!0,n.runtime.error=t,n.emit("error",t),r();});},i.prototype._flush=function(t){var e=this;this.processor.flush().then(function(t){if(t.length>0)return e.result.processResult(t)}).then(function(){e.processEnd(t);},function(r){e.emit("error",r),t();});},i.prototype.processEnd=function(t){this.result.endProcess(),this.emit("done"),t();},Object.defineProperty(i.prototype,"parsedLineNumber",{get:function(){return this.runtime.parsedLineNumber},enumerable:!0,configurable:!0}),i}(o.Transform);e.Converter=f;}).call(this,r(11).setImmediate);},function(t,e,r){(function(t,e){!function(t,r){if(!t.setImmediate){var n,i=1,o={},s=!1,a=t.document,u=Object.getPrototypeOf&&Object.getPrototypeOf(t);u=u&&u.setTimeout?u:t,"[object process]"==={}.toString.call(t.process)?n=function(t){e.nextTick(function(){l(t);});}:function(){if(t.postMessage&&!t.importScripts){var e=!0,r=t.onmessage;return t.onmessage=function(){e=!1;},t.postMessage("","*"),t.onmessage=r,e}}()?function(){var e="setImmediate$"+Math.random()+"$",r=function(r){r.source===t&&"string"==typeof r.data&&0===r.data.indexOf(e)&&l(+r.data.slice(e.length));};t.addEventListener?t.addEventListener("message",r,!1):t.attachEvent("onmessage",r),n=function(r){t.postMessage(e+r,"*");};}():t.MessageChannel?function(){var t=new MessageChannel;t.port1.onmessage=function(t){l(t.data);},n=function(e){t.port2.postMessage(e);};}():a&&"onreadystatechange"in a.createElement("script")?function(){var t=a.documentElement;n=function(e){var r=a.createElement("script");r.onreadystatechange=function(){l(e),r.onreadystatechange=null,t.removeChild(r),r=null;},t.appendChild(r);};}():n=function(t){setTimeout(l,0,t);},u.setImmediate=function(t){"function"!=typeof t&&(t=new Function(""+t));for(var e=new Array(arguments.length-1),r=0;r<e.length;r++)e[r]=arguments[r+1];var s={callback:t,args:e};return o[i]=s,n(i),i++},u.clearImmediate=c;}function c(t){delete o[t];}function l(t){if(s)setTimeout(l,0,t);else {var e=o[t];if(e){s=!0;try{!function(t){var e=t.callback,n=t.args;switch(n.length){case 0:e();break;case 1:e(n[0]);break;case 2:e(n[0],n[1]);break;case 3:e(n[0],n[1],n[2]);break;default:e.apply(r,n);}}(e);}finally{c(t),s=!1;}}}}}("undefined"==typeof self?void 0===t?this:t:self);}).call(this,r(0),r(4));},function(t,e,r){t.exports=i;var n=r(12).EventEmitter;function i(){n.call(this);}r(2)(i,n),i.Readable=r(13),i.Writable=r(46),i.Duplex=r(47),i.Transform=r(48),i.PassThrough=r(49),i.Stream=i,i.prototype.pipe=function(t,e){var r=this;function i(e){t.writable&&!1===t.write(e)&&r.pause&&r.pause();}function o(){r.readable&&r.resume&&r.resume();}r.on("data",i),t.on("drain",o),t._isStdio||e&&!1===e.end||(r.on("end",a),r.on("close",u));var s=!1;function a(){s||(s=!0,t.end());}function u(){s||(s=!0,"function"==typeof t.destroy&&t.destroy());}function c(t){if(l(),0===n.listenerCount(this,"error"))throw t}function l(){r.removeListener("data",i),t.removeListener("drain",o),r.removeListener("end",a),r.removeListener("close",u),r.removeListener("error",c),t.removeListener("error",c),r.removeListener("end",l),r.removeListener("close",l),t.removeListener("close",l);}return r.on("error",c),t.on("error",c),r.on("end",l),r.on("close",l),t.on("close",l),t.emit("pipe",r),t};},function(t,e){var r={}.toString;t.exports=Array.isArray||function(t){return "[object Array]"==r.call(t)};},function(t,e,r){e.byteLength=function(t){var e=c(t),r=e[0],n=e[1];return 3*(r+n)/4-n},e.toByteArray=function(t){for(var e,r=c(t),n=r[0],s=r[1],a=new o(3*(n+s)/4-s),u=0,l=s>0?n-4:n,f=0;f<l;f+=4)e=i[t.charCodeAt(f)]<<18|i[t.charCodeAt(f+1)]<<12|i[t.charCodeAt(f+2)]<<6|i[t.charCodeAt(f+3)],a[u++]=e>>16&255,a[u++]=e>>8&255,a[u++]=255&e;return 2===s&&(e=i[t.charCodeAt(f)]<<2|i[t.charCodeAt(f+1)]>>4,a[u++]=255&e),1===s&&(e=i[t.charCodeAt(f)]<<10|i[t.charCodeAt(f+1)]<<4|i[t.charCodeAt(f+2)]>>2,a[u++]=e>>8&255,a[u++]=255&e),a},e.fromByteArray=function(t){for(var e,r=t.length,i=r%3,o=[],s=0,a=r-i;s<a;s+=16383)o.push(f(t,s,s+16383>a?a:s+16383));return 1===i?(e=t[r-1],o.push(n[e>>2]+n[e<<4&63]+"==")):2===i&&(e=(t[r-2]<<8)+t[r-1],o.push(n[e>>10]+n[e>>4&63]+n[e<<2&63]+"=")),o.join("")};for(var n=[],i=[],o="undefined"!=typeof Uint8Array?Uint8Array:Array,s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",a=0,u=s.length;a<u;++a)n[a]=s[a],i[s.charCodeAt(a)]=a;function c(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=t.indexOf("=");return -1===r&&(r=e),[r,r===e?0:4-r%4]}function l(t){return n[t>>18&63]+n[t>>12&63]+n[t>>6&63]+n[63&t]}function f(t,e,r){for(var n,i=[],o=e;o<r;o+=3)n=(t[o]<<16&16711680)+(t[o+1]<<8&65280)+(255&t[o+2]),i.push(l(n));return i.join("")}i["-".charCodeAt(0)]=62,i["_".charCodeAt(0)]=63;},function(t,e){e.read=function(t,e,r,n,i){var o,s,a=8*i-n-1,u=(1<<a)-1,c=u>>1,l=-7,f=r?i-1:0,h=r?-1:1,p=t[e+f];for(f+=h,o=p&(1<<-l)-1,p>>=-l,l+=a;l>0;o=256*o+t[e+f],f+=h,l-=8);for(s=o&(1<<-l)-1,o>>=-l,l+=n;l>0;s=256*s+t[e+f],f+=h,l-=8);if(0===o)o=1-c;else {if(o===u)return s?NaN:1/0*(p?-1:1);s+=Math.pow(2,n),o-=c;}return (p?-1:1)*s*Math.pow(2,o-n)},e.write=function(t,e,r,n,i,o){var s,a,u,c=8*o-i-1,l=(1<<c)-1,f=l>>1,h=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,p=n?0:o-1,d=n?1:-1,_=e<0||0===e&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(a=isNaN(e)?1:0,s=l):(s=Math.floor(Math.log(e)/Math.LN2),e*(u=Math.pow(2,-s))<1&&(s--,u*=2),(e+=s+f>=1?h/u:h*Math.pow(2,1-f))*u>=2&&(s++,u/=2),s+f>=l?(a=0,s=l):s+f>=1?(a=(e*u-1)*Math.pow(2,i),s+=f):(a=e*Math.pow(2,f-1)*Math.pow(2,i),s=0));i>=8;t[r+p]=255&a,p+=d,a/=256,i-=8);for(s=s<<i|a,c+=i;c>0;t[r+p]=255&s,p+=d,s/=256,c-=8);t[r+p-d]|=128*_;};},function(t,e){var r={}.toString;t.exports=Array.isArray||function(t){return "[object Array]"==r.call(t)};},function(t,e){},function(t,e,r){var n=r(7).Buffer,i=r(43);function o(t,e,r){t.copy(e,r);}t.exports=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.head=null,this.tail=null,this.length=0;}return t.prototype.push=function(t){var e={data:t,next:null};this.length>0?this.tail.next=e:this.head=e,this.tail=e,++this.length;},t.prototype.unshift=function(t){var e={data:t,next:this.head};0===this.length&&(this.tail=e),this.head=e,++this.length;},t.prototype.shift=function(){if(0!==this.length){var t=this.head.data;return 1===this.length?this.head=this.tail=null:this.head=this.head.next,--this.length,t}},t.prototype.clear=function(){this.head=this.tail=null,this.length=0;},t.prototype.join=function(t){if(0===this.length)return "";for(var e=this.head,r=""+e.data;e=e.next;)r+=t+e.data;return r},t.prototype.concat=function(t){if(0===this.length)return n.alloc(0);if(1===this.length)return this.head.data;for(var e=n.allocUnsafe(t>>>0),r=this.head,i=0;r;)o(r.data,e,i),i+=r.data.length,r=r.next;return e},t}(),i&&i.inspect&&i.inspect.custom&&(t.exports.prototype[i.inspect.custom]=function(){var t=i.inspect({length:this.length});return this.constructor.name+" "+t});},function(t,e){},function(t,e,r){(function(e){function r(t){try{if(!e.localStorage)return !1}catch(t){return !1}var r=e.localStorage[t];return null!=r&&"true"===String(r).toLowerCase()}t.exports=function(t,e){if(r("noDeprecation"))return t;var n=!1;return function(){if(!n){if(r("throwDeprecation"))throw new Error(e);r("traceDeprecation")?console.trace(e):console.warn(e),n=!0;}return t.apply(this,arguments)}};}).call(this,r(0));},function(t,e,r){t.exports=o;var n=r(27),i=r(5);function o(t){if(!(this instanceof o))return new o(t);n.call(this,t);}i.inherits=r(2),i.inherits(o,n),o.prototype._transform=function(t,e,r){r(null,t);};},function(t,e,r){t.exports=r(14);},function(t,e,r){t.exports=r(1);},function(t,e,r){t.exports=r(13).Transform;},function(t,e,r){t.exports=r(13).PassThrough;},function(t,e,r){Object.defineProperty(e,"__esModule",{value:!0}),e.mergeParams=function(t){var e={delimiter:",",ignoreColumns:void 0,includeColumns:void 0,quote:'"',trim:!0,checkType:!1,ignoreEmpty:!1,noheader:!1,headers:void 0,flatKeys:!1,maxRowLength:0,checkColumn:!1,escape:'"',colParser:{},eol:void 0,alwaysSplitAtEOL:!1,output:"json",nullObject:!1,downstreamFormat:"line",needEmitAll:!0};for(var r in t||(t={}),t)t.hasOwnProperty(r)&&(Array.isArray(t[r])?e[r]=[].concat(t[r]):e[r]=t[r]);return e};},function(t,e,r){Object.defineProperty(e,"__esModule",{value:!0}),e.initParseRuntime=function(t){var e=t.parseParam,r={needProcessIgnoreColumn:!1,needProcessIncludeColumn:!1,selectedColumns:void 0,ended:!1,hasError:!1,error:void 0,delimiter:t.parseParam.delimiter,eol:t.parseParam.eol,columnConv:[],headerType:[],headerTitle:[],headerFlag:[],headers:void 0,started:!1,parsedLineNumber:0,columnValueSetter:[]};return e.ignoreColumns&&(r.needProcessIgnoreColumn=!0),e.includeColumns&&(r.needProcessIncludeColumn=!0),r};},function(t,e,r){(function(t){var n=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e;}||function(t,e){for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);};return function(e,r){function n(){this.constructor=e;}t(e,r),e.prototype=null===r?Object.create(r):(n.prototype=r.prototype,new n);}}(),i=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});var o=r(53),s=i(r(15)),a=r(54),u=i(r(16)),c=r(57),l=r(28),f=r(58),h=i(r(59)),p=i(r(29)),d=function(e){function r(){var t=null!==e&&e.apply(this,arguments)||this;return t.rowSplit=new f.RowSplit(t.converter),t.eolEmitted=!1,t._needEmitEol=void 0,t.headEmitted=!1,t._needEmitHead=void 0,t}return n(r,e),r.prototype.flush=function(){var t=this;if(this.runtime.csvLineBuffer&&this.runtime.csvLineBuffer.length>0){var e=this.runtime.csvLineBuffer;return this.runtime.csvLineBuffer=void 0,this.process(e,!0).then(function(e){return t.runtime.csvLineBuffer&&t.runtime.csvLineBuffer.length>0?s.default.reject(p.default.unclosed_quote(t.runtime.parsedLineNumber,t.runtime.csvLineBuffer.toString())):s.default.resolve(e)})}return s.default.resolve([])},r.prototype.destroy=function(){return s.default.resolve()},Object.defineProperty(r.prototype,"needEmitEol",{get:function(){return void 0===this._needEmitEol&&(this._needEmitEol=this.converter.listeners("eol").length>0),this._needEmitEol},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"needEmitHead",{get:function(){return void 0===this._needEmitHead&&(this._needEmitHead=this.converter.listeners("header").length>0),this._needEmitHead},enumerable:!0,configurable:!0}),r.prototype.process=function(t,e){var r,n=this;return void 0===e&&(e=!1),r=e?t.toString():a.prepareData(t,this.converter.parseRuntime),s.default.resolve().then(function(){return n.runtime.preRawDataHook?n.runtime.preRawDataHook(r):r}).then(function(t){return t&&t.length>0?n.processCSV(t,e):s.default.resolve([])})},r.prototype.processCSV=function(t,e){var r=this,n=this.params,i=this.runtime;i.eol||u.default(t,i),this.needEmitEol&&!this.eolEmitted&&i.eol&&(this.converter.emit("eol",i.eol),this.eolEmitted=!0),n.ignoreEmpty&&!i.started&&(t=l.trimLeft(t));var o=c.stringToLines(t,i);return e?(o.lines.push(o.partial),o.partial=""):this.prependLeftBuf(l.bufFromString(o.partial)),o.lines.length>0?(i.preFileLineHook?this.runPreLineHook(o.lines):s.default.resolve(o.lines)).then(function(t){return i.started||r.runtime.headers?r.processCSVBody(t):r.processDataWithHead(t)}):s.default.resolve([])},r.prototype.processDataWithHead=function(t){if(this.params.noheader)this.params.headers?this.runtime.headers=this.params.headers:this.runtime.headers=[];else {for(var e="",r=[];t.length;){var n=e+t.shift(),i=this.rowSplit.parse(n);if(i.closed){r=i.cells,e="";break}e=n+u.default(n,this.runtime);}if(this.prependLeftBuf(l.bufFromString(e)),0===r.length)return [];this.params.headers?this.runtime.headers=this.params.headers:this.runtime.headers=r;}return (this.runtime.needProcessIgnoreColumn||this.runtime.needProcessIncludeColumn)&&this.filterHeader(),this.needEmitHead&&!this.headEmitted&&(this.converter.emit("header",this.runtime.headers),this.headEmitted=!0),this.processCSVBody(t)},r.prototype.filterHeader=function(){if(this.runtime.selectedColumns=[],this.runtime.headers){for(var t=this.runtime.headers,e=0;e<t.length;e++)if(this.params.ignoreColumns)if(this.params.ignoreColumns.test(t[e])){if(!this.params.includeColumns||!this.params.includeColumns.test(t[e]))continue;this.runtime.selectedColumns.push(e);}else this.runtime.selectedColumns.push(e);else this.params.includeColumns?this.params.includeColumns.test(t[e])&&this.runtime.selectedColumns.push(e):this.runtime.selectedColumns.push(e);this.runtime.headers=l.filterArray(this.runtime.headers,this.runtime.selectedColumns);}},r.prototype.processCSVBody=function(t){if("line"===this.params.output)return t;var e=this.rowSplit.parseMultiLines(t);return this.prependLeftBuf(l.bufFromString(e.partial)),"csv"===this.params.output?e.rowsCells:h.default(e.rowsCells,this.converter)},r.prototype.prependLeftBuf=function(e){e&&(this.runtime.csvLineBuffer?this.runtime.csvLineBuffer=t.concat([e,this.runtime.csvLineBuffer]):this.runtime.csvLineBuffer=e);},r.prototype.runPreLineHook=function(t){var e=this;return new s.default(function(r,n){!function t(e,r,n,i){if(n>=e.length)i();else if(r.preFileLineHook){var o=e[n],s=r.preFileLineHook(o,r.parsedLineNumber+n);if(n++,s&&s.then)s.then(function(o){e[n-1]=o,t(e,r,n,i);});else {for(e[n-1]=s;n<e.length;)e[n]=r.preFileLineHook(e[n],r.parsedLineNumber+n),n++;i();}}else i();}(t,e.runtime,0,function(e){e?n(e):r(t);});})},r}(o.Processor);e.ProcessorLocal=d;}).call(this,r(3).Buffer);},function(t,e,r){Object.defineProperty(e,"__esModule",{value:!0});var n=function(t){this.converter=t,this.params=t.parseParam,this.runtime=t.parseRuntime;};e.Processor=n;},function(t,e,r){(function(t){var n=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});var i=n(r(55));e.prepareData=function(e,r){var n=function(e,r){return r.csvLineBuffer&&r.csvLineBuffer.length>0?t.concat([r.csvLineBuffer,e]):e}(e,r);r.csvLineBuffer=void 0;var o=function(t,e){var r=t.length-1;if(0!=(128&t[r])){for(;128==(192&t[r]);)r--;r--;}return r!=t.length-1?(e.csvLineBuffer=t.slice(r+1),t.slice(0,r+1)):t}(n,r).toString("utf8");return !1===r.started?i.default(o):o};}).call(this,r(3).Buffer);},function(t,e,r){(function(e){var n=r(56);t.exports=function(t){return "string"==typeof t&&65279===t.charCodeAt(0)?t.slice(1):e.isBuffer(t)&&n(t)&&239===t[0]&&187===t[1]&&191===t[2]?t.slice(3):t};}).call(this,r(3).Buffer);},function(t,e){t.exports=function(t){for(var e=0;e<t.length;)if(9==t[e]||10==t[e]||13==t[e]||32<=t[e]&&t[e]<=126)e+=1;else if(194<=t[e]&&t[e]<=223&&128<=t[e+1]&&t[e+1]<=191)e+=2;else if(224==t[e]&&160<=t[e+1]&&t[e+1]<=191&&128<=t[e+2]&&t[e+2]<=191||(225<=t[e]&&t[e]<=236||238==t[e]||239==t[e])&&128<=t[e+1]&&t[e+1]<=191&&128<=t[e+2]&&t[e+2]<=191||237==t[e]&&128<=t[e+1]&&t[e+1]<=159&&128<=t[e+2]&&t[e+2]<=191)e+=3;else {if(!(240==t[e]&&144<=t[e+1]&&t[e+1]<=191&&128<=t[e+2]&&t[e+2]<=191&&128<=t[e+3]&&t[e+3]<=191||241<=t[e]&&t[e]<=243&&128<=t[e+1]&&t[e+1]<=191&&128<=t[e+2]&&t[e+2]<=191&&128<=t[e+3]&&t[e+3]<=191||244==t[e]&&128<=t[e+1]&&t[e+1]<=143&&128<=t[e+2]&&t[e+2]<=191&&128<=t[e+3]&&t[e+3]<=191))return !1;e+=4;}return !0};},function(t,e,r){var n=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});var i=n(r(16));e.stringToLines=function(t,e){var r=i.default(t,e),n=t.split(r);return {lines:n,partial:n.pop()||""}};},function(t,e,r){var n=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});var i=n(r(16)),o=r(28),s=[",","|","\t",";",":"],a=function(){function t(t){this.conv=t,this.cachedRegExp={},this.delimiterEmitted=!1,this._needEmitDelimiter=void 0,this.quote=t.parseParam.quote,this.trim=t.parseParam.trim,this.escape=t.parseParam.escape;}return Object.defineProperty(t.prototype,"needEmitDelimiter",{get:function(){return void 0===this._needEmitDelimiter&&(this._needEmitDelimiter=this.conv.listeners("delimiter").length>0),this._needEmitDelimiter},enumerable:!0,configurable:!0}),t.prototype.parse=function(t){if(0===t.length||this.conv.parseParam.ignoreEmpty&&0===t.trim().length)return {cells:[],closed:!0};var e=this.quote,r=this.trim;this.escape,(this.conv.parseRuntime.delimiter instanceof Array||"auto"===this.conv.parseRuntime.delimiter.toLowerCase())&&(this.conv.parseRuntime.delimiter=this.getDelimiter(t)),this.needEmitDelimiter&&!this.delimiterEmitted&&(this.conv.emit("delimiter",this.conv.parseRuntime.delimiter),this.delimiterEmitted=!0);var n=this.conv.parseRuntime.delimiter,i=t.split(n);if("off"===e){if(r)for(var o=0;o<i.length;o++)i[o]=i[o].trim();return {cells:i,closed:!0}}return this.toCSVRow(i,r,e,n)},t.prototype.toCSVRow=function(t,e,r,n){for(var i=[],s=!1,a="",u=0,c=t.length;u<c;u++){var l=t[u];!s&&e&&(l=o.trimLeft(l));var f=l.length;if(s)this.isQuoteClose(l)?(s=!1,a+=n+(l=l.substr(0,f-1)),a=this.escapeQuote(a),e&&(a=o.trimRight(a)),i.push(a),a=""):a+=n+l;else {if(2===f&&l===this.quote+this.quote){i.push("");continue}if(this.isQuoteOpen(l)){if(l=l.substr(1),this.isQuoteClose(l)){l=l.substring(0,l.lastIndexOf(r)),l=this.escapeQuote(l),i.push(l);continue}if(-1!==l.indexOf(r)){for(var h=0,p="",d=0,_=l;d<_.length;d++){var v=_[d];v===r&&p!==this.escape?(h++,p=""):p=v;}if(h%2==1){e&&(l=o.trimRight(l)),i.push(r+l);continue}s=!0,a+=l;continue}s=!0,a+=l;continue}e&&(l=o.trimRight(l)),i.push(l);}}return {cells:i,closed:!s}},t.prototype.getDelimiter=function(t){var e;if("auto"===this.conv.parseParam.delimiter)e=s;else {if(!(this.conv.parseParam.delimiter instanceof Array))return this.conv.parseParam.delimiter;e=this.conv.parseParam.delimiter;}var r=0,n=",";return e.forEach(function(e){var i=t.split(e).length;i>r&&(n=e,r=i);}),n},t.prototype.isQuoteOpen=function(t){var e=this.quote,r=this.escape;return t[0]===e&&(t[1]!==e||t[1]===r&&(t[2]===e||2===t.length))},t.prototype.isQuoteClose=function(t){var e=this.quote,r=this.escape;this.conv.parseParam.trim&&(t=o.trimRight(t));for(var n=0,i=t.length-1;t[i]===e||t[i]===r;)i--,n++;return n%2!=0},t.prototype.escapeQuote=function(t){var e="es|"+this.quote+"|"+this.escape;void 0===this.cachedRegExp[e]&&(this.cachedRegExp[e]=new RegExp("\\"+this.escape+"\\"+this.quote,"g"));var r=this.cachedRegExp[e];return t.replace(r,this.quote)},t.prototype.parseMultiLines=function(t){for(var e=[],r="";t.length;){var n=r+t.shift(),s=this.parse(n);0===s.cells.length&&this.conv.parseParam.ignoreEmpty||(s.closed||this.conv.parseParam.alwaysSplitAtEOL?(this.conv.parseRuntime.selectedColumns?e.push(o.filterArray(s.cells,this.conv.parseRuntime.selectedColumns)):e.push(s.cells),r=""):r=n+(i.default(n,this.conv.parseRuntime)||"\n"));}return {rowsCells:e,partial:r}},t}();e.RowSplit=a;},function(t,e,r){var n=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});var i=n(r(29)),o=n(r(60)),s=/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/;function a(t,e,r){if(e.parseParam.checkColumn&&e.parseRuntime.headers&&t.length!==e.parseRuntime.headers.length)throw i.default.column_mismatched(e.parseRuntime.parsedLineNumber+r);return function(t,e,r){for(var n=!1,i={},o=0,s=t.length;o<s;o++){var a=t[o];if(!r.parseParam.ignoreEmpty||""!==a){n=!0;var u=e[o];u&&""!==u||(u=e[o]="field"+(o+1));var f=c(u,o,r);if(f){var h=f(a,u,i,t,o);void 0!==h&&l(i,u,h,r,o);}else {if(r.parseParam.checkType)a=p(a,u,o,r)(a);void 0!==a&&l(i,u,a,r,o);}}}return n?i:null}(t,e.parseRuntime.headers||[],e)||null}e.default=function(t,e){for(var r=[],n=0,i=t.length;n<i;n++){var o=a(t[n],e,n);o&&r.push(o);}return r};var u={string:_,number:d,omit:function(){}};function c(t,e,r){if(void 0!==r.parseRuntime.columnConv[e])return r.parseRuntime.columnConv[e];var n=r.parseParam.colParser[t];if(void 0===n)return r.parseRuntime.columnConv[e]=null;if("object"==typeof n&&(n=n.cellParser||"string"),"string"==typeof n){n=n.trim().toLowerCase();var i=u[n];return r.parseRuntime.columnConv[e]=i||null}return r.parseRuntime.columnConv[e]="function"==typeof n?n:null}function l(t,e,r,n,i){if(!n.parseRuntime.columnValueSetter[i])if(n.parseParam.flatKeys)n.parseRuntime.columnValueSetter[i]=f;else if(e.indexOf(".")>-1){for(var o=e.split("."),s=!0;o.length>0;)if(0===o.shift().length){s=!1;break}!s||n.parseParam.colParser[e]&&n.parseParam.colParser[e].flat?n.parseRuntime.columnValueSetter[i]=f:n.parseRuntime.columnValueSetter[i]=h;}else n.parseRuntime.columnValueSetter[i]=f;!0===n.parseParam.nullObject&&"null"===r&&(r=null),n.parseRuntime.columnValueSetter[i](t,e,r);}function f(t,e,r){t[e]=r;}function h(t,e,r){o.default(t,e,r);}function p(t,e,r,n){return n.parseRuntime.headerType[r]?n.parseRuntime.headerType[r]:e.indexOf("number#!")>-1?n.parseRuntime.headerType[r]=d:e.indexOf("string#!")>-1?n.parseRuntime.headerType[r]=_:n.parseParam.checkType?n.parseRuntime.headerType[r]=v:n.parseRuntime.headerType[r]=_}function d(t){var e=parseFloat(t);return isNaN(e)?t:e}function _(t){return t.toString()}function v(t){var e=t.trim();return ""===e?_(t):s.test(e)?d(t):5===e.length&&"false"===e.toLowerCase()||4===e.length&&"true"===e.toLowerCase()?function(t){var e=t.trim();return 5!==e.length||"false"!==e.toLowerCase()}(t):"{"===e[0]&&"}"===e[e.length-1]||"["===e[0]&&"]"===e[e.length-1]?function(t){try{return JSON.parse(t)}catch(e){return t}}(t):_(t)}},function(t,e,r){var n=r(61);t.exports=function(t,e,r){return null==t?t:n(t,e,r)};},function(t,e,r){var n=r(62),i=r(74),o=r(103),s=r(20),a=r(104);t.exports=function(t,e,r,u){if(!s(t))return t;for(var c=-1,l=(e=i(e,t)).length,f=l-1,h=t;null!=h&&++c<l;){var p=a(e[c]),d=r;if(c!=f){var _=h[p];void 0===(d=u?u(_,p,h):void 0)&&(d=s(_)?_:o(e[c+1])?[]:{});}n(h,p,d),h=h[p];}return t};},function(t,e,r){var n=r(63),i=r(31),o=Object.prototype.hasOwnProperty;t.exports=function(t,e,r){var s=t[e];o.call(t,e)&&i(s,r)&&(void 0!==r||e in t)||n(t,e,r);};},function(t,e,r){var n=r(64);t.exports=function(t,e,r){"__proto__"==e&&n?n(t,e,{configurable:!0,enumerable:!0,value:r,writable:!0}):t[e]=r;};},function(t,e,r){var n=r(17),i=function(){try{var t=n(Object,"defineProperty");return t({},"",{}),t}catch(t){}}();t.exports=i;},function(t,e,r){var n=r(66),i=r(70),o=r(20),s=r(72),a=/^\[object .+?Constructor\]$/,u=Function.prototype,c=Object.prototype,l=u.toString,f=c.hasOwnProperty,h=RegExp("^"+l.call(f).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");t.exports=function(t){return !(!o(t)||i(t))&&(n(t)?h:a).test(s(t))};},function(t,e,r){var n=r(30),i=r(20);t.exports=function(t){if(!i(t))return !1;var e=n(t);return "[object Function]"==e||"[object GeneratorFunction]"==e||"[object AsyncFunction]"==e||"[object Proxy]"==e};},function(t,e,r){(function(e){var r="object"==typeof e&&e&&e.Object===Object&&e;t.exports=r;}).call(this,r(0));},function(t,e,r){var n=r(18),i=Object.prototype,o=i.hasOwnProperty,s=i.toString,a=n?n.toStringTag:void 0;t.exports=function(t){var e=o.call(t,a),r=t[a];try{t[a]=void 0;var n=!0;}catch(t){}var i=s.call(t);return n&&(e?t[a]=r:delete t[a]),i};},function(t,e){var r=Object.prototype.toString;t.exports=function(t){return r.call(t)};},function(t,e,r){var n=r(71),i=function(){var t=/[^.]+$/.exec(n&&n.keys&&n.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""}();t.exports=function(t){return !!i&&i in t};},function(t,e,r){var n=r(19)["__core-js_shared__"];t.exports=n;},function(t,e){var r=Function.prototype.toString;t.exports=function(t){if(null!=t){try{return r.call(t)}catch(t){}try{return t+""}catch(t){}}return ""};},function(t,e){t.exports=function(t,e){return null==t?void 0:t[e]};},function(t,e,r){var n=r(21),i=r(75),o=r(77),s=r(100);t.exports=function(t,e){return n(t)?t:i(t,e)?[t]:o(s(t))};},function(t,e,r){var n=r(21),i=r(22),o=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,s=/^\w*$/;t.exports=function(t,e){if(n(t))return !1;var r=typeof t;return !("number"!=r&&"symbol"!=r&&"boolean"!=r&&null!=t&&!i(t))||s.test(t)||!o.test(t)||null!=e&&t in Object(e)};},function(t,e){t.exports=function(t){return null!=t&&"object"==typeof t};},function(t,e,r){var n=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,i=/\\(\\)?/g,o=r(78)(function(t){var e=[];return 46===t.charCodeAt(0)&&e.push(""),t.replace(n,function(t,r,n,o){e.push(n?o.replace(i,"$1"):r||t);}),e});t.exports=o;},function(t,e,r){var n=r(79);t.exports=function(t){var e=n(t,function(t){return 500===r.size&&r.clear(),t}),r=e.cache;return e};},function(t,e,r){var n=r(80),i="Expected a function";function o(t,e){if("function"!=typeof t||null!=e&&"function"!=typeof e)throw new TypeError(i);var r=function(){var n=arguments,i=e?e.apply(this,n):n[0],o=r.cache;if(o.has(i))return o.get(i);var s=t.apply(this,n);return r.cache=o.set(i,s)||o,s};return r.cache=new(o.Cache||n),r}o.Cache=n,t.exports=o;},function(t,e,r){var n=r(81),i=r(95),o=r(97),s=r(98),a=r(99);function u(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1]);}}u.prototype.clear=n,u.prototype.delete=i,u.prototype.get=o,u.prototype.has=s,u.prototype.set=a,t.exports=u;},function(t,e,r){var n=r(82),i=r(88),o=r(94);t.exports=function(){this.size=0,this.__data__={hash:new n,map:new(o||i),string:new n};};},function(t,e,r){var n=r(83),i=r(84),o=r(85),s=r(86),a=r(87);function u(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1]);}}u.prototype.clear=n,u.prototype.delete=i,u.prototype.get=o,u.prototype.has=s,u.prototype.set=a,t.exports=u;},function(t,e,r){var n=r(8);t.exports=function(){this.__data__=n?n(null):{},this.size=0;};},function(t,e){t.exports=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e};},function(t,e,r){var n=r(8),i=Object.prototype.hasOwnProperty;t.exports=function(t){var e=this.__data__;if(n){var r=e[t];return "__lodash_hash_undefined__"===r?void 0:r}return i.call(e,t)?e[t]:void 0};},function(t,e,r){var n=r(8),i=Object.prototype.hasOwnProperty;t.exports=function(t){var e=this.__data__;return n?void 0!==e[t]:i.call(e,t)};},function(t,e,r){var n=r(8);t.exports=function(t,e){var r=this.__data__;return this.size+=this.has(t)?0:1,r[t]=n&&void 0===e?"__lodash_hash_undefined__":e,this};},function(t,e,r){var n=r(89),i=r(90),o=r(91),s=r(92),a=r(93);function u(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1]);}}u.prototype.clear=n,u.prototype.delete=i,u.prototype.get=o,u.prototype.has=s,u.prototype.set=a,t.exports=u;},function(t,e){t.exports=function(){this.__data__=[],this.size=0;};},function(t,e,r){var n=r(9),i=Array.prototype.splice;t.exports=function(t){var e=this.__data__,r=n(e,t);return !(r<0||(r==e.length-1?e.pop():i.call(e,r,1),--this.size,0))};},function(t,e,r){var n=r(9);t.exports=function(t){var e=this.__data__,r=n(e,t);return r<0?void 0:e[r][1]};},function(t,e,r){var n=r(9);t.exports=function(t){return n(this.__data__,t)>-1};},function(t,e,r){var n=r(9);t.exports=function(t,e){var r=this.__data__,i=n(r,t);return i<0?(++this.size,r.push([t,e])):r[i][1]=e,this};},function(t,e,r){var n=r(17)(r(19),"Map");t.exports=n;},function(t,e,r){var n=r(10);t.exports=function(t){var e=n(this,t).delete(t);return this.size-=e?1:0,e};},function(t,e){t.exports=function(t){var e=typeof t;return "string"==e||"number"==e||"symbol"==e||"boolean"==e?"__proto__"!==t:null===t};},function(t,e,r){var n=r(10);t.exports=function(t){return n(this,t).get(t)};},function(t,e,r){var n=r(10);t.exports=function(t){return n(this,t).has(t)};},function(t,e,r){var n=r(10);t.exports=function(t,e){var r=n(this,t),i=r.size;return r.set(t,e),this.size+=r.size==i?0:1,this};},function(t,e,r){var n=r(101);t.exports=function(t){return null==t?"":n(t)};},function(t,e,r){var n=r(18),i=r(102),o=r(21),s=r(22),a=n?n.prototype:void 0,u=a?a.toString:void 0;t.exports=function t(e){if("string"==typeof e)return e;if(o(e))return i(e,t)+"";if(s(e))return u?u.call(e):"";var r=e+"";return "0"==r&&1/e==-1/0?"-0":r};},function(t,e){t.exports=function(t,e){for(var r=-1,n=null==t?0:t.length,i=Array(n);++r<n;)i[r]=e(t[r],r,t);return i};},function(t,e){var r=/^(?:0|[1-9]\d*)$/;t.exports=function(t,e){var n=typeof t;return !!(e=null==e?9007199254740991:e)&&("number"==n||"symbol"!=n&&r.test(t))&&t>-1&&t%1==0&&t<e};},function(t,e,r){var n=r(22);t.exports=function(t){if("string"==typeof t||n(t))return t;var e=t+"";return "0"==e&&1/t==-1/0?"-0":e};},function(t,e,r){var n=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});var i=n(r(15)),o=r(106),s=function(){function t(t){this.converter=t,this.finalResult=[];}return Object.defineProperty(t.prototype,"needEmitLine",{get:function(){return !!this.converter.parseRuntime.subscribe&&!!this.converter.parseRuntime.subscribe.onNext||this.needPushDownstream},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"needPushDownstream",{get:function(){return void 0===this._needPushDownstream&&(this._needPushDownstream=this.converter.listeners("data").length>0||this.converter.listeners("readable").length>0),this._needPushDownstream},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"needEmitAll",{get:function(){return !!this.converter.parseRuntime.then&&this.converter.parseParam.needEmitAll},enumerable:!0,configurable:!0}),t.prototype.processResult=function(t){var e=this,r=this.converter.parseRuntime.parsedLineNumber;return this.needPushDownstream&&"array"===this.converter.parseParam.downstreamFormat&&0===r&&a(this.converter,"["+o.EOL),new i.default(function(r,n){e.needEmitLine?function t(e,r,n,i,o){if(n>=e.length)o();else if(r.parseRuntime.subscribe&&r.parseRuntime.subscribe.onNext){var s=r.parseRuntime.subscribe.onNext,u=e[n],c=s(u,r.parseRuntime.parsedLineNumber+n);if(n++,c&&c.then)c.then(function(){!function(e,r,n,i,o,s,u){o&&a(n,u),t(e,n,i,o,s);}(e,0,r,n,i,o,u);},o);else {for(i&&a(r,u);n<e.length;){var l=e[n];s(l,r.parseRuntime.parsedLineNumber+n),n++,i&&a(r,l);}o();}}else {if(i)for(;n<e.length;)l=e[n++],a(r,l);o();}}(t,e.converter,0,e.needPushDownstream,function(i){i?n(i):(e.appendFinalResult(t),r());}):(e.appendFinalResult(t),r());})},t.prototype.appendFinalResult=function(t){this.needEmitAll&&(this.finalResult=this.finalResult.concat(t)),this.converter.parseRuntime.parsedLineNumber+=t.length;},t.prototype.processError=function(t){this.converter.parseRuntime.subscribe&&this.converter.parseRuntime.subscribe.onError&&this.converter.parseRuntime.subscribe.onError(t),this.converter.parseRuntime.then&&this.converter.parseRuntime.then.onrejected&&this.converter.parseRuntime.then.onrejected(t);},t.prototype.endProcess=function(){this.converter.parseRuntime.then&&this.converter.parseRuntime.then.onfulfilled&&(this.needEmitAll?this.converter.parseRuntime.then.onfulfilled(this.finalResult):this.converter.parseRuntime.then.onfulfilled([])),this.converter.parseRuntime.subscribe&&this.converter.parseRuntime.subscribe.onCompleted&&this.converter.parseRuntime.subscribe.onCompleted(),this.needPushDownstream&&"array"===this.converter.parseParam.downstreamFormat&&a(this.converter,"]"+o.EOL);},t}();function a(t,e){if("object"!=typeof e||t.options.objectMode)t.push(e);else {var r=JSON.stringify(e);t.push(r+("array"===t.parseParam.downstreamFormat?","+o.EOL:o.EOL),"utf8");}}e.Result=s;},function(t,e){e.endianness=function(){return "LE"},e.hostname=function(){return "undefined"!=typeof location?location.hostname:""},e.loadavg=function(){return []},e.uptime=function(){return 0},e.freemem=function(){return Number.MAX_VALUE},e.totalmem=function(){return Number.MAX_VALUE},e.cpus=function(){return []},e.type=function(){return "Browser"},e.release=function(){return "undefined"!=typeof navigator?navigator.appVersion:""},e.networkInterfaces=e.getNetworkInterfaces=function(){return {}},e.arch=function(){return "javascript"},e.platform=function(){return "browser"},e.tmpdir=e.tmpDir=function(){return "/tmp"},e.EOL="\n",e.homedir=function(){return "/"};}]);
    });

    var csv = unwrapExports(browser);

    function readFile(file) {
        if(!file) return;
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");

            reader.onload = (event) => resolve(event.target.result);

            reader.onerror = function (evt) {
                reject("error reading file");
            };
        });
    }

    /* src\views\main\upload-area\CsvImporter.svelte generated by Svelte v3.21.0 */

    const { console: console_1$2 } = globals;
    const file$j = "src\\views\\main\\upload-area\\CsvImporter.svelte";

    function create_fragment$j(ctx) {
    	let importer;
    	let input;
    	let t0;
    	let p;
    	let t1;
    	let i;
    	let t3;
    	let br;
    	let t4;
    	let dispose;

    	const block = {
    		c: function create() {
    			importer = element("importer");
    			input = element("input");
    			t0 = space();
    			p = element("p");
    			t1 = text("Csv Cashflow ");
    			i = element("i");
    			i.textContent = "Import";
    			t3 = space();
    			br = element("br");
    			t4 = text(" (CAMT)");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "class", "svelte-1lkwqok");
    			add_location(input, file$j, 32, 4, 1003);
    			attr_dev(i, "class", "svelte-1lkwqok");
    			add_location(i, file$j, 33, 20, 1068);
    			attr_dev(br, "class", "svelte-1lkwqok");
    			add_location(br, file$j, 33, 34, 1082);
    			attr_dev(p, "class", "svelte-1lkwqok");
    			add_location(p, file$j, 33, 4, 1052);
    			attr_dev(importer, "class", "dropbox svelte-1lkwqok");
    			add_location(importer, file$j, 31, 0, 971);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, importer, anchor);
    			append_dev(importer, input);
    			append_dev(importer, t0);
    			append_dev(importer, p);
    			append_dev(p, t1);
    			append_dev(p, i);
    			append_dev(p, t3);
    			append_dev(p, br);
    			append_dev(p, t4);
    			if (remount) dispose();
    			dispose = listen_dev(input, "change", /*importCsv*/ ctx[0], false, false, false);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(importer);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function notExists(existingItems) {
    	return itemToCheck => !existingItems.some(item => new Cashflow(itemToCheck).isEqual(item));
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let dbCashflowList = [];
    	const unsubscribe = dbCashflow.subscribe(newCashflowList => dbCashflowList = newCashflowList);

    	async function importCsv(event) {
    		let file = event.target.files[0];
    		let content = await readFile(file);

    		csv({ delimiter: ";" }).fromString(content).then(result => {
    			const newFlowItems = result.filter(notExists(dbCashflowList));
    			console.log("New Items: ", newFlowItems);
    			dbCashflow.addItem(newFlowItems);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<CsvImporter> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CsvImporter", $$slots, []);

    	$$self.$capture_state = () => ({
    		get: get_store_value,
    		csv,
    		readFile,
    		CashFlow: Cashflow,
    		dbCashflow,
    		dbCashflowList,
    		unsubscribe,
    		importCsv,
    		notExists
    	});

    	$$self.$inject_state = $$props => {
    		if ("dbCashflowList" in $$props) dbCashflowList = $$props.dbCashflowList;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [importCsv];
    }

    class CsvImporter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CsvImporter",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src\views\main\upload-area\UploadArea.svelte generated by Svelte v3.21.0 */
    const file$k = "src\\views\\main\\upload-area\\UploadArea.svelte";

    function create_fragment$k(ctx) {
    	let wrapper;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let current;
    	const selectdbfile = new SelectDbFile({ $$inline: true });
    	const csvimport = new CsvImporter({ $$inline: true });

    	const block = {
    		c: function create() {
    			wrapper = element("wrapper");
    			div0 = element("div");
    			div0.textContent = "Upload Area";
    			t1 = space();
    			div1 = element("div");
    			create_component(selectdbfile.$$.fragment);
    			t2 = space();
    			create_component(csvimport.$$.fragment);
    			attr_dev(div0, "class", "title svelte-17d1h0y");
    			add_location(div0, file$k, 6, 4, 164);
    			attr_dev(div1, "class", "upload-areas svelte-17d1h0y");
    			add_location(div1, file$k, 7, 4, 206);
    			attr_dev(wrapper, "class", "upload-area-wrapper svelte-17d1h0y");
    			add_location(wrapper, file$k, 5, 0, 121);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, wrapper, anchor);
    			append_dev(wrapper, div0);
    			append_dev(wrapper, t1);
    			append_dev(wrapper, div1);
    			mount_component(selectdbfile, div1, null);
    			append_dev(div1, t2);
    			mount_component(csvimport, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectdbfile.$$.fragment, local);
    			transition_in(csvimport.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectdbfile.$$.fragment, local);
    			transition_out(csvimport.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(wrapper);
    			destroy_component(selectdbfile);
    			destroy_component(csvimport);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UploadArea> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("UploadArea", $$slots, []);
    	$$self.$capture_state = () => ({ SelectDbFile, CsvImport: CsvImporter });
    	return [];
    }

    class UploadArea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UploadArea",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src\views\main\Main.svelte generated by Svelte v3.21.0 */
    const file$l = "src\\views\\main\\Main.svelte";

    // (50:4) {:else}
    function create_else_block$3(ctx) {
    	let current;
    	const mdkeyboardarrowright = new MdKeyboardArrowRight({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mdkeyboardarrowright.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mdkeyboardarrowright, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdkeyboardarrowright.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdkeyboardarrowright.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mdkeyboardarrowright, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(50:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (48:4) {#if expandMenu}
    function create_if_block$6(ctx) {
    	let current;
    	const mdkeyboardarrowleft = new MdKeyboardArrowLeft({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mdkeyboardarrowleft.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mdkeyboardarrowleft, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdkeyboardarrowleft.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdkeyboardarrowleft.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mdkeyboardarrowleft, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(48:4) {#if expandMenu}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let home;
    	let div9;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t2;
    	let div5;
    	let div3;
    	let t3;
    	let div4;
    	let t5;
    	let div8;
    	let div6;
    	let current_block_type_index;
    	let if_block;
    	let t6;
    	let div7;
    	let div9_class_value;
    	let t8;
    	let t9;
    	let div10;
    	let current;
    	let dispose;
    	const mdimportexport = new MdImportExport({ $$inline: true });
    	const mdrefresh = new MdRefresh({ $$inline: true });
    	const if_block_creators = [create_if_block$6, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*expandMenu*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const uploadarea = new UploadArea({ $$inline: true });
    	const card_spread_levels = [/*activeCard*/ ctx[1]];
    	let card_props = {};

    	for (let i = 0; i < card_spread_levels.length; i += 1) {
    		card_props = assign(card_props, card_spread_levels[i]);
    	}

    	const card = new Card({ props: card_props, $$inline: true });

    	const block = {
    		c: function create() {
    			home = element("home");
    			div9 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(mdimportexport.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "Cashflows";
    			t2 = space();
    			div5 = element("div");
    			div3 = element("div");
    			create_component(mdrefresh.$$.fragment);
    			t3 = space();
    			div4 = element("div");
    			div4.textContent = "Periodicals";
    			t5 = space();
    			div8 = element("div");
    			div6 = element("div");
    			if_block.c();
    			t6 = space();
    			div7 = element("div");
    			div7.textContent = "Collapse Menu";
    			t8 = space();
    			create_component(uploadarea.$$.fragment);
    			t9 = space();
    			div10 = element("div");
    			create_component(card.$$.fragment);
    			attr_dev(div0, "class", "icon svelte-vdsebd");
    			add_location(div0, file$l, 29, 3, 888);
    			attr_dev(div1, "class", "text svelte-vdsebd");
    			add_location(div1, file$l, 32, 3, 946);
    			attr_dev(div2, "class", "menu-item home svelte-vdsebd");
    			add_location(div2, file$l, 28, 2, 808);
    			attr_dev(div3, "class", "icon svelte-vdsebd");
    			add_location(div3, file$l, 37, 3, 1081);
    			attr_dev(div4, "class", "text svelte-vdsebd");
    			add_location(div4, file$l, 40, 3, 1134);
    			attr_dev(div5, "class", "menu-item home svelte-vdsebd");
    			add_location(div5, file$l, 36, 2, 1004);
    			attr_dev(div6, "class", "icon svelte-vdsebd");
    			add_location(div6, file$l, 46, 3, 1270);
    			attr_dev(div7, "class", "text svelte-vdsebd");
    			add_location(div7, file$l, 53, 3, 1409);
    			attr_dev(div8, "class", "menu-item expand-toggle svelte-vdsebd");
    			add_location(div8, file$l, 45, 2, 1196);
    			attr_dev(div9, "class", div9_class_value = "menu " + (/*expandMenu*/ ctx[0] ? "expand" : "") + " svelte-vdsebd");
    			add_location(div9, file$l, 27, 1, 757);
    			attr_dev(div10, "class", "card-wrapper svelte-vdsebd");
    			add_location(div10, file$l, 62, 1, 1513);
    			attr_dev(home, "class", "svelte-vdsebd");
    			add_location(home, file$l, 26, 0, 748);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, home, anchor);
    			append_dev(home, div9);
    			append_dev(div9, div2);
    			append_dev(div2, div0);
    			mount_component(mdimportexport, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div9, t2);
    			append_dev(div9, div5);
    			append_dev(div5, div3);
    			mount_component(mdrefresh, div3, null);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div9, t5);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			if_blocks[current_block_type_index].m(div6, null);
    			append_dev(div8, t6);
    			append_dev(div8, div7);
    			append_dev(home, t8);
    			mount_component(uploadarea, home, null);
    			append_dev(home, t9);
    			append_dev(home, div10);
    			mount_component(card, div10, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div2, "click", /*click_handler*/ ctx[6], false, false, false),
    				listen_dev(div5, "click", /*click_handler_1*/ ctx[7], false, false, false),
    				listen_dev(div8, "click", /*click_handler_2*/ ctx[8], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div6, null);
    			}

    			if (!current || dirty & /*expandMenu*/ 1 && div9_class_value !== (div9_class_value = "menu " + (/*expandMenu*/ ctx[0] ? "expand" : "") + " svelte-vdsebd")) {
    				attr_dev(div9, "class", div9_class_value);
    			}

    			const card_changes = (dirty & /*activeCard*/ 2)
    			? get_spread_update(card_spread_levels, [get_spread_object(/*activeCard*/ ctx[1])])
    			: {};

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdimportexport.$$.fragment, local);
    			transition_in(mdrefresh.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(uploadarea.$$.fragment, local);
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdimportexport.$$.fragment, local);
    			transition_out(mdrefresh.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(uploadarea.$$.fragment, local);
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(home);
    			destroy_component(mdimportexport);
    			destroy_component(mdrefresh);
    			if_blocks[current_block_type_index].d();
    			destroy_component(uploadarea);
    			destroy_component(card);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let expandMenu = false;
    	let periodicalFlow = new Card$1("cashflows");
    	let periodicals = new Card$1("periodicals");
    	let activeCard = periodicalFlow;

    	function toggleExpand() {
    		$$invalidate(0, expandMenu = !expandMenu);
    	}

    	function setActiveCard(card) {
    		$$invalidate(1, activeCard = card);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Main", $$slots, []);
    	const click_handler = () => setActiveCard(periodicalFlow);
    	const click_handler_1 = () => setActiveCard(periodicals);
    	const click_handler_2 = () => toggleExpand();

    	$$self.$capture_state = () => ({
    		MdImportExport,
    		MdRefresh,
    		MdKeyboardArrowRight,
    		MdKeyboardArrowLeft,
    		Card,
    		CardModel: Card$1,
    		UploadArea,
    		expandMenu,
    		periodicalFlow,
    		periodicals,
    		activeCard,
    		toggleExpand,
    		setActiveCard
    	});

    	$$self.$inject_state = $$props => {
    		if ("expandMenu" in $$props) $$invalidate(0, expandMenu = $$props.expandMenu);
    		if ("periodicalFlow" in $$props) $$invalidate(2, periodicalFlow = $$props.periodicalFlow);
    		if ("periodicals" in $$props) $$invalidate(3, periodicals = $$props.periodicals);
    		if ("activeCard" in $$props) $$invalidate(1, activeCard = $$props.activeCard);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		expandMenu,
    		activeCard,
    		periodicalFlow,
    		periodicals,
    		toggleExpand,
    		setActiveCard,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src\shared\components\EditPeriodicalModal.svelte generated by Svelte v3.21.0 */

    const { console: console_1$3 } = globals;
    const file$m = "src\\shared\\components\\EditPeriodicalModal.svelte";

    // (36:0) {#if showModal}
    function create_if_block$7(ctx) {
    	let edit_periodical;
    	let div2;
    	let div0;
    	let t0;
    	let h1;
    	let t2;
    	let current_block_type_index;
    	let if_block0;
    	let t3;
    	let div1;
    	let edit_periodical_transition;
    	let current;
    	let dispose;
    	const mdclose = new MdClose({ $$inline: true });
    	const if_block_creators = [create_if_block_2$4, create_else_block_1$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*periodical*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*periodical*/ ctx[1]._id) return create_if_block_1$4;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			edit_periodical = element("edit-periodical");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(mdclose.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Edit / Create Periodical";
    			t2 = space();
    			if_block0.c();
    			t3 = space();
    			div1 = element("div");
    			if_block1.c();
    			attr_dev(div0, "class", "close-button svelte-wys8ia");
    			add_location(div0, file$m, 38, 12, 1126);
    			attr_dev(h1, "class", "svelte-wys8ia");
    			add_location(h1, file$m, 42, 12, 1255);
    			attr_dev(div1, "class", "save-button svelte-wys8ia");
    			add_location(div1, file$m, 63, 12, 2233);
    			attr_dev(div2, "class", "modal svelte-wys8ia");
    			add_location(div2, file$m, 37, 8, 1093);
    			set_custom_element_data(edit_periodical, "class", "svelte-wys8ia");
    			add_location(edit_periodical, file$m, 36, 4, 1050);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, edit_periodical, anchor);
    			append_dev(edit_periodical, div2);
    			append_dev(div2, div0);
    			mount_component(mdclose, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, h1);
    			append_dev(div2, t2);
    			if_blocks[current_block_type_index].m(div2, null);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			if_block1.m(div1, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div0, "click", /*click_handler*/ ctx[3], false, false, false),
    				listen_dev(div1, "click", /*click_handler_1*/ ctx[8], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div2, t3);
    			}

    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdclose.$$.fragment, local);
    			transition_in(if_block0);

    			add_render_callback(() => {
    				if (!edit_periodical_transition) edit_periodical_transition = create_bidirectional_transition(edit_periodical, fade, {}, true);
    				edit_periodical_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdclose.$$.fragment, local);
    			transition_out(if_block0);
    			if (!edit_periodical_transition) edit_periodical_transition = create_bidirectional_transition(edit_periodical, fade, {}, false);
    			edit_periodical_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(edit_periodical);
    			destroy_component(mdclose);
    			if_blocks[current_block_type_index].d();
    			if_block1.d();
    			if (detaching && edit_periodical_transition) edit_periodical_transition.end();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(36:0) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    // (47:12) {:else}
    function create_else_block_1$1(ctx) {
    	let div4;
    	let div0;
    	let updating_value;
    	let t0;
    	let div1;
    	let updating_value_1;
    	let t1;
    	let div2;
    	let updating_value_2;
    	let t2;
    	let div3;
    	let updating_checked;
    	let current;

    	function input0_value_binding(value) {
    		/*input0_value_binding*/ ctx[4].call(null, value);
    	}

    	let input0_props = { type: "text", label: "Beneficiary" };

    	if (/*periodical*/ ctx[1].beneficiary !== void 0) {
    		input0_props.value = /*periodical*/ ctx[1].beneficiary;
    	}

    	const input0 = new Input({ props: input0_props, $$inline: true });
    	binding_callbacks.push(() => bind(input0, "value", input0_value_binding));

    	function input1_value_binding(value) {
    		/*input1_value_binding*/ ctx[5].call(null, value);
    	}

    	let input1_props = { type: "text", label: "Comment" };

    	if (/*periodical*/ ctx[1].comment !== void 0) {
    		input1_props.value = /*periodical*/ ctx[1].comment;
    	}

    	const input1 = new Input({ props: input1_props, $$inline: true });
    	binding_callbacks.push(() => bind(input1, "value", input1_value_binding));

    	function input2_value_binding(value) {
    		/*input2_value_binding*/ ctx[6].call(null, value);
    	}

    	let input2_props = { type: "number", label: "Amount" };

    	if (/*periodical*/ ctx[1].amount !== void 0) {
    		input2_props.value = /*periodical*/ ctx[1].amount;
    	}

    	const input2 = new Input({ props: input2_props, $$inline: true });
    	binding_callbacks.push(() => bind(input2, "value", input2_value_binding));

    	function checkbox_checked_binding(value) {
    		/*checkbox_checked_binding*/ ctx[7].call(null, value);
    	}

    	let checkbox_props = { label: "is Monthly" };

    	if (/*periodical*/ ctx[1].valueIsMonthly !== void 0) {
    		checkbox_props.checked = /*periodical*/ ctx[1].valueIsMonthly;
    	}

    	const checkbox = new Checkbox({ props: checkbox_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox, "checked", checkbox_checked_binding));

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			create_component(input0.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(input1.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(input2.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			create_component(checkbox.$$.fragment);
    			attr_dev(div0, "class", "input-form max-width svelte-wys8ia");
    			add_location(div0, file$m, 48, 20, 1479);
    			attr_dev(div1, "class", "input-form max-width svelte-wys8ia");
    			add_location(div1, file$m, 51, 20, 1666);
    			attr_dev(div2, "class", "input-form max-width svelte-wys8ia");
    			add_location(div2, file$m, 54, 20, 1845);
    			attr_dev(div3, "class", "input-form svelte-wys8ia");
    			add_location(div3, file$m, 57, 20, 2024);
    			attr_dev(div4, "class", "master-data svelte-wys8ia");
    			add_location(div4, file$m, 47, 16, 1432);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			mount_component(input0, div0, null);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			mount_component(input1, div1, null);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			mount_component(input2, div2, null);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			mount_component(checkbox, div3, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input0_changes = {};

    			if (!updating_value && dirty & /*periodical*/ 2) {
    				updating_value = true;
    				input0_changes.value = /*periodical*/ ctx[1].beneficiary;
    				add_flush_callback(() => updating_value = false);
    			}

    			input0.$set(input0_changes);
    			const input1_changes = {};

    			if (!updating_value_1 && dirty & /*periodical*/ 2) {
    				updating_value_1 = true;
    				input1_changes.value = /*periodical*/ ctx[1].comment;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			input1.$set(input1_changes);
    			const input2_changes = {};

    			if (!updating_value_2 && dirty & /*periodical*/ 2) {
    				updating_value_2 = true;
    				input2_changes.value = /*periodical*/ ctx[1].amount;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			input2.$set(input2_changes);
    			const checkbox_changes = {};

    			if (!updating_checked && dirty & /*periodical*/ 2) {
    				updating_checked = true;
    				checkbox_changes.checked = /*periodical*/ ctx[1].valueIsMonthly;
    				add_flush_callback(() => updating_checked = false);
    			}

    			checkbox.$set(checkbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input0.$$.fragment, local);
    			transition_in(input1.$$.fragment, local);
    			transition_in(input2.$$.fragment, local);
    			transition_in(checkbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input0.$$.fragment, local);
    			transition_out(input1.$$.fragment, local);
    			transition_out(input2.$$.fragment, local);
    			transition_out(checkbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(input0);
    			destroy_component(input1);
    			destroy_component(input2);
    			destroy_component(checkbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(47:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (45:12) {#if !periodical}
    function create_if_block_2$4(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "There was an error. No periodical is selected";
    			attr_dev(h2, "class", "svelte-wys8ia");
    			add_location(h2, file$m, 45, 16, 1339);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(45:12) {#if !periodical}",
    		ctx
    	});

    	return block;
    }

    // (67:16) {:else}
    function create_else_block$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Create");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(67:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (65:16) {#if periodical._id}
    function create_if_block_1$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Save");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(65:16) {#if periodical._id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showModal*/ ctx[0] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showModal*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showModal*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function cancel() {
    	periodicalModalService.resetAndClose();
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let showModal = false;
    	let periodical = null;

    	periodicalModalService.register(() => {
    		$$invalidate(0, showModal = periodicalModalService.show);
    		$$invalidate(1, periodical = periodicalModalService.periodical);
    	});

    	function save() {
    		if (!periodical._id) {
    			console.log("new", periodical);
    			dbPeriodicals.addItem(periodical);
    		} else {
    			console.log("edit", periodical);
    			dbPeriodicals.updateItem(periodical);
    		}

    		periodicalModalService.resetAndClose();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<EditPeriodicalModal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EditPeriodicalModal", $$slots, []);
    	const click_handler = () => cancel();

    	function input0_value_binding(value) {
    		periodical.beneficiary = value;
    		$$invalidate(1, periodical);
    	}

    	function input1_value_binding(value) {
    		periodical.comment = value;
    		$$invalidate(1, periodical);
    	}

    	function input2_value_binding(value) {
    		periodical.amount = value;
    		$$invalidate(1, periodical);
    	}

    	function checkbox_checked_binding(value) {
    		periodical.valueIsMonthly = value;
    		$$invalidate(1, periodical);
    	}

    	const click_handler_1 = () => save();

    	$$self.$capture_state = () => ({
    		fade,
    		MdClose,
    		Input,
    		Checkbox,
    		periodicalModalService,
    		dbPeriodicals,
    		showModal,
    		periodical,
    		cancel,
    		save
    	});

    	$$self.$inject_state = $$props => {
    		if ("showModal" in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ("periodical" in $$props) $$invalidate(1, periodical = $$props.periodical);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showModal,
    		periodical,
    		save,
    		click_handler,
    		input0_value_binding,
    		input1_value_binding,
    		input2_value_binding,
    		checkbox_checked_binding,
    		click_handler_1
    	];
    }

    class EditPeriodicalModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditPeriodicalModal",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.21.0 */
    const file$n = "src\\App.svelte";

    function create_fragment$n(ctx) {
    	let main;
    	let t;
    	let current;
    	const home = new Main({ $$inline: true });
    	const editperiodicalmodal = new EditPeriodicalModal({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(home.$$.fragment);
    			t = space();
    			create_component(editperiodicalmodal.$$.fragment);
    			add_location(main, file$n, 5, 0, 151);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(home, main, null);
    			append_dev(main, t);
    			mount_component(editperiodicalmodal, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			transition_in(editperiodicalmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			transition_out(editperiodicalmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(home);
    			destroy_component(editperiodicalmodal);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Home: Main, EditPeriodicalModal });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    const app$1 = new App({
    	target: document.body,
    	props: {
    		
    	}
    });

    return app$1;

}());
//# sourceMappingURL=bundle.js.map
