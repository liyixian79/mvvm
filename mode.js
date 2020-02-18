
function Dep(){
    this.subs = [];
}
Dep.prototype.addSub = function(sub){
    this.subs.push(sub);

}

Dep.prototype.notify = function(){
    this.subs.forEach(sub => {
        sub.update();
        
    });
}

function Watcher(fn){
this.fn = fn;
}
Watcher.prototype.update = function(){
    this.fn();
}
let watcher = new Watcher(()=>{console.log(1)});

let dep = new Dep();
dep.addSub(watcher);
dep.addSub(watcher);
dep.addSub(watcher);
console.log(dep.subs);
dep.notify();