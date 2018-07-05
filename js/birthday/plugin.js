var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function() {
    "use strict";
    var t = Math.PI / 180,
        e = function(t, e, i, n, r) {
            this.p = e, this.f = "function" == typeof t[e], this.start = this.value = this.f ? t[e.indexOf("set") || "function" != typeof t["get" + e.substr(3)] ? e : "get" + e.substr(3)]() : parseFloat(t[e]), this.velocity = i || 0, this.v = this.velocity / r, n || 0 === n ? (this.acceleration = n, this.a = this.acceleration / (r * r)) : this.acceleration = this.a = 0
        },
        o = function(t) {
			return !0;
        }(window ? window.location.host : ""),
        a = Math.random(),
        h = _gsScope._gsDefine.globals,
        l = h.com.greensock.core.Animation._rootFramesTimeline,
        c = _gsScope._gsDefine.plugin({
            propName: "physics2D",
            version: "0.2.0",
            API: 2,
            init: function(a, h, c, d) {
                if ("function" == typeof h && (h = h(d, a)), !o) return window.location.href = "http://" + r + s + "?plugin=" + n + "&source=" + i, !1;
                this._target = a, this._tween = c, this._runBackwards = c.vars.runBackwards === !0, this._step = 0;
                for (var g, u = c._timeline, f = +h.angle || 0, p = +h.velocity || 0, _ = +h.acceleration || 0, m = h.xProp || "x", C = h.yProp || "y", v = h.accelerationAngle || 0 === h.accelerationAngle ? +h.accelerationAngle : f; u._timeline;) u = u._timeline;
                return this._stepsPerTimeUnit = g = u === l ? 1 : 30, h.gravity && (_ = +h.gravity, v = 90), f *= t, v *= t, this._friction = 1 - +(h.friction || 0), this._overwriteProps.push(m), this._overwriteProps.push(C), this._x = new e(a, m, Math.cos(f) * p, Math.cos(v) * _, g), this._y = new e(a, C, Math.sin(f) * p, Math.sin(v) * _, g), this._skipX = this._skipY = !1, o
            },
            set: function() {
                var t, e, i, n, r, s, o = this._tween._time,
                    a = this._x,
                    h = this._y;
                if (this._runBackwards === !0 && (o = this._tween._duration - o), 1 === this._friction) i = o * o * .5, t = a.start + (a.velocity * o + a.acceleration * i), e = h.start + (h.velocity * o + h.acceleration * i);
                else {
                    if (o *= this._stepsPerTimeUnit, n = s = (0 | o) - this._step, r = o % 1, 0 > s)
                        for (s = -s; --s > -1;) a.value -= a.v, h.value -= h.v, a.v /= this._friction, h.v /= this._friction, a.v -= a.a, h.v -= h.a;
                    else
                        for (; --s > -1;) a.v += a.a, h.v += h.a, a.v *= this._friction, h.v *= this._friction, a.value += a.v, h.value += h.v;
                    t = a.value + a.v * r, e = h.value + h.v * r, this._step += n
                }
                this._skipX || (a.m && (t = a.m(t, this._target)), a.f ? this._target[a.p](t) : this._target[a.p] = t), this._skipY || (h.m && (e = h.m(e, this._target)), h.f ? this._target[h.p](e) : this._target[h.p] = e)
            }
        }),
        d = c.prototype;
    d._kill = function(t) {
        return null != t[this._x.p] && (this._skipX = !0), null != t[this._y.p] && (this._skipY = !0), this._super._kill.call(this, t)
    }, d._mod = function(t) {
        var e = t[this._x.p] || t.physics2D;
        e && "function" == typeof e && (this._x.m = e), e = t[this._y.p] || t.physics2D, e && "function" == typeof e && (this._y.m = e)
    }, c._autoCSS = !0, c._cssRegister = function() {
        var t = h.CSSPlugin;
        if (t) {
            var e = t._internals,
                i = e._parseToProxy,
                n = e._setPluginRatio,
                r = e.CSSPropTween;
            e._registerComplexSpecialProp("physics2D", {
                parser: function(t, e, s, o, h, l) {
                    l = new c;
                    var d, g = e.xProp || "x",
                        u = e.yProp || "y",
                        f = {};
                    return f[g] = f[u] = a++, d = i(t, f, o, h, l), h = new r(t, "physics2D", 0, 0, d.pt, 2), h.data = d, h.plugin = l, h.setRatio = n, l._onInitTween(d.proxy, e, o._tween), h
                }
            })
        }
    }
}), _gsScope._gsDefine && _gsScope._gsQueue.pop()();