// ------- BUDGET CONTROLLER -------------------------------------------------------------------------
var budgetController = (function(){

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage =  Math.round((this.value/ totalIncome) * 100) ;
        }else{
            this.percentage = -1;
        }        
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;

    };

    var data = {
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    
    
    return{
        addItem: function(type, desc, val){
            var newItem, ID;
            //[0,1,2,3,4]array structure (length = 5)
            //[1,2,3,4,5] next ID = 6
            //[1,2,4,6,8] next ID = 8

            // create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }            
              
            // create new item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID, desc, val);

            }else if(type === 'inc'){
                newItem = new Income(ID, desc, val);

            }
            // push the new item to the data structure
            data.allItems[type].push(newItem);

            // returns the new element
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            // id="inc-6"
            // id = 6
            // ids = [1 2 4 6 8]
            //   arr[0 1 2 3 4]
            // index = 3
            ids = data.allItems[type].map(function(current){
                return current.id;
            })

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget = income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate percentage of income that we spent
                //e.g Expense = 100, Income = 200, spent 50% = 100/200 = 0.5 * 100 = 50
                //  Math.round is used to get rid of the decimals like 33.354841% = 33%
            if(data.totals.inc > 0){
                data.percentage =  Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }    
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function(){
            var allPercentages;
            allPercentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            };

        },

        testing: function(){
            console.log(data);
        }
    }

})();



// ------- UI CONTROLLER -------------------------------------------------------------------------
var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container:'.container',
        expPercentLabel:'.item__percentage'
    };

    var formatNumber= function(num, type){
        var numSplit;
        /* + or - before the number
            exactly 2  decimal points
            comma to separate the thousands                
            555,565,415.148 ->  + 2,541.15
                2000  ->  + 2,000.00*/
        //abs remove the sign of the number
        num = Math.abs(num);
        //fix number to have  always 2 decimal numbers e.g 20.00 or 45.57
        num = num.toFixed(2);
        //splits the number into an array      
        numSplit = num.split('.');   
        int = numSplit[0];
            if (int.length > 3 && int.length < 7){
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }else if (int.length > 6){
                int = int.substr(0, int.length - 6) + ',' + int.substr(int.length - 6 , 3) +','+ int.substr(int.length - 3, 3);
            }                    
        
        dec = numSplit[1];            

        return (type === 'exp' ?  '-' :  '+') + ' ' + int + '.' +dec;
    };   
    
    return{
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value, //will be "inc" or "exp"
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) 
            }            
        },
        addListItem:function(obj, type){
            var html, newHtml, element;

            // Create HTML string with placeholder text
            if(type === 'inc'){
                //income html
                element = DOMstrings.incomeContainer;
                html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            }else if(type === 'exp'){
                //expense HTML
                element = DOMstrings.expensesContainer;
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            }
            
            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value , type) );

            // insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);

        },

        deleteListItem: function(selectorID){
            var elm;
            elm = document.getElementById(selectorID);
            elm.parentNode.removeChild(elm);
        },

        clearFields:function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(curr, idx , arr){
                curr.value = '';
            });
            fieldsArr[0].focus();


        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc': type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent= formatNumber(obj.budget, type) ;
            document.querySelector(DOMstrings.incomeLabel).textContent=  formatNumber(obj.totalIncome, 'inc') ;
            document.querySelector(DOMstrings.expensesLabel).textContent= formatNumber(obj.totalExpenses,'exp') ;
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent= obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent= '---';
            }
        },
        
        displayPercentages: function(percentages){
            var fields, nodeListForEach;

            nodeListForEach = function(list, callback){
                var i;
                for(i= 0; i < list.length; i++){
                    callback(list[i], i);
                }
            };

            fields = document.querySelectorAll(DOMstrings.expPercentLabel);


            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });
        },
        
       getDOMstrings:function(){
            return DOMstrings;
        }

    }
})();

// ------- GLOBAL CONTROLLER ------------------------------------------------------------------------- 
var controller = (function(budgCtrl,UICtrl){

    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();

            document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
            document.addEventListener('keypress', function(event){        
                if(event === 13 || event.which === 13){
                ctrlAddItem();            
            };
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

    };

    var updateBudget = function(){
          // 5. calculate the budget
          budgCtrl.calculateBudget();
          // 5.1  return the budget
          var budget = budgCtrl.getBudget();
          // 6. display budget in UI
          UICtrl.displayBudget(budget);
    };

    var updatePercentages= function(){
        var percentages;
        // 1.calculate percentages
        budgCtrl.calculatePercentages();
        // 2.read percentages from the budget controller
        percentages = budgCtrl.getPercentages();
        // 3.update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
   

    var ctrlAddItem = function(){
        var input, newItem;
            // 1. get the filed input data
            input = UICtrl.getInput();

            if(input.description !== "" && !isNaN(input.value) && input.value > 0){
                // 2. add the item to the budget controller
                newItem = budgCtrl.addItem(input.type, input.description, input.value);
                // 3. add the item to the UI 
                UICtrl.addListItem(newItem, input.type );
                // 4. clear fields
                UICtrl.clearFields();
                // 5. calculate and update budget
                updateBudget();
                // 6. calculate and update percentages
                updatePercentages();
            }
          
    };
    var ctrlDeleteItem = function(event){
        var itemID, sliptID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            //inc-1
            sliptID = itemID.split('-');
            type = sliptID[0];
            ID = parseInt(sliptID[1]);

            // 1. delete item from the data struct  ure
            budgCtrl.deleteItem(type, ID);
            // 2. delete item from the UI
            UICtrl.deleteListItem(itemID);
            // 3.Update and show the new budget
            updateBudget();
            updatePercentages();
        }
        

    };

    return{

        init: function(){
            console.log('app has started');
            UICtrl.displayBudget( {
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });

            setupEventListeners();
        }
    }

    
   
})(budgetController,UIController);

controller.init();