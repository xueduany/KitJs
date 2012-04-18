// standard library imports
const Cairo = imports.cairo;
const Canvas = imports.html.canvas;
const Lang = imports.lang;
const Mainloop = imports.mainloop;

// gi imports
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;

const Clock = imports.clock;

function GtkClock(args) {
    this._init(args);
}

GtkClock.prototype = {
    _init : function(args) {
        this._canvas = new Canvas.Canvas({ width: 150, height: 150 });
        this._buildUI();
        Mainloop.timeout_add(1000, Lang.bind(this, this._onTimeoutUpdate));
    },

    _buildUI : function() {
        this._window = new Gtk.Window({ type: Gtk.WindowType.TOPLEVEL });
        this._window.set_size_request(150, 150);
        this._window.connect("destroy", Lang.bind(this, this._onWindowDestroy));

        this._da = new Gtk.DrawingArea();
        this._da.set_app_paintable(true);
        this._da.connect("expose-event", Lang.bind(this, this._onDrawingAreaExpose));
        this._window.add(this._da);
    },

    _render : function() {
        let cr = Gdk.cairo_create(this._da.window);
        // draw a white background
        cr.setSourceRGB(1, 1, 1);
        cr.setOperator(Cairo.Operator.SOURCE);
        cr.paint();

        // draw the clock
        this._context = this._canvas.getContext('2d', cr);
        Clock.renderClock(this._context);
    },

    _onTimeoutUpdate : function() {
        this._render();
        return true;
    },

    _onDrawingAreaExpose : function(window, event) {
        this._render();
        return false;
    },

    _onWindowDestroy : function(window) {
        Gtk.main_quit();
    },

    run : function() {
        this._window.show_all();
        Gtk.main();
    }

}

function main() {
    Gtk.init(0, null);

    let app = new GtkClock(ARGV[0]);
    app.run();
    return 0;
}

main();