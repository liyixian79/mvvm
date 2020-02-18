function vuetest(options = {}){
   this.$options = options; //所有属性挂载在$options 上

   var data = this._data = this.$options.data;
   observe(data);
   for(let key in data){
    Object.defineProperty(this,key,{
        enumerable:true,
        get(){
           return this._data[key];
        },
        set(newVal){  //更改值
            this._data[key] = newVal  
        }
    })
   }
   initComputed.call(this);
   new Compile(options.el,this);
}
function initComputed(){
    let vm = this ;
    let computed = this.$options.computed;
    Object.keys(computed).forEach(function(key){
        Object.defineProperty(vm,key,{
            get:typeof computed[key] =='function'? computed[key]: computed[key].get,
            set(){

            }
        })

    })
    
}

function Compile(el,vm){
    vm.$el = document.querySelector(el);
   let fragment = document.createDocumentFragment();
   while(child = vm.$el.firstChild){
       fragment.appendChild(child);
   }
   replace(fragment);
   function replace(fragment){
      Array.from(fragment.childNodes).forEach(function(node){
          let text = node.textContent;
          let reg =/\{\{(.*)\}\}/;
          if(node.nodeType === 3 && reg.test(text)){
              let arr = RegExp.$1.split('.');
              let val = vm ;
              arr.forEach(function(k){
                  val = val[k];
              });
              new Watcher(vm,RegExp.$1,function(newVal){
                node.textContent = text.replace(/\{\{(.*)\}\}/,newVal);
              })
              node.textContent = text.replace(/\{\{(.*)\}\}/,val);

          }
          if(node.nodeType === 1){
              let nodeAttrs = node.attributes;
              Array.from(nodeAttrs).forEach(function(attr){
                 let name = attr.name;
                 let exp = attr.value;
                  if(name.indexOf('v-') == 0){
                     node.value = vm[exp];
                  }
                  new Watcher(vm,exp,function(newVal){
                      node.value = newVal;
                  });
                  node.addEventListener('input',function(e){
                      let newVal = e.target.value;
                      vm[exp] = newVal;
                  })
              })
          }
          if(node.childNodes){
            replace(node);
          }
      })
   }
    vm.$el.appendChild(fragment);
}
  
//给每个属性增加 Object.defineproperty
function Observe(data){   //主要逻辑
    let dep = new Dep();
    for(let key in data){   //data属性定义时使用 Object.defineproperty
       let val = data[key];
        observe(val);
        Object.defineProperty(data,key,{
            enumerable:true,
            get(){
                Dep.target && dep.addSub(Dep.target);
               return val;
            },
            set(newVal){  //更改值
                if(newVal === val){
                    return;
                }
                val = newVal;
                observe(newVal);
                dep.notify();
            }
        })
    }
   
}


function observe(data){
    if(typeof(data)!=='object') return ;
     return new Observe(data)
}

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

function Watcher(vm,exp,fn){
    this.fn = fn;
    this.vm = vm;
    this.exp = exp;   //添加订阅
    Dep.target = this;
    let val = vm;
    let arr = exp.split('.');
    arr.forEach(function(k){
        val = val[k];
    })
    Dep.target = null;
    }

Watcher.prototype.update = function(){
    let val = this.vm;
    let arr = this.exp.split('.');
    arr.forEach(function(k){
        val = val[k];
    })
    this.fn(val);
    }

 
  