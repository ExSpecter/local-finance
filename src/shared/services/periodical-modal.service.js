import Periodical from '@shared/models/periodical.model.js';

class EditPeriodicalService {
    constructor() {
        this.show = false
        this.periodical = null
        this.listeners = []
    }

    editItem(item) {
        this.periodical = item
        this.show = true
        this.notify()
    }

    createItem(item) {
        this.periodical = item ? item : new Periodical()
        this.show = true
        this.notify();
    }

    resetAndClose() {
        this.show = false
        this.periodical = null
        this.notify();
    }

    register(func) {
        this.listeners.push(func)
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

export default Singleton.getInstance();