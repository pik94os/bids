define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('CalendarHeader',['$scope', '$stateParams', function($scope, $stateParams){
        $scope.open = $stateParams.open;
    }]).controller('Calendar',['$scope','$http', '$rootScope', '$stateParams', function($scope,$http,$rootScope,$stateParams){
        var d = new Date;
        $scope.calendar = createCalendarForMonth();
        $scope.currentDay = (new Date).getDate();
        $scope.currentMonth = (new Date).getMonth();
        $scope.currentYear = (new Date).getFullYear();
        $scope.getYear = function (incr) {
            var tempDate = new Date(d.getTime());
            tempDate.setMonth(d.getMonth()+incr);
            return tempDate.getFullYear();
        };
        function createCalendarForMonth() {
            
            var currentDate = new Date();
            var theMonth = ["Октябрь", "Ноябрь", "Декабрь", "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
                "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь", "Январь"];
            
            var selectedYear = d.getFullYear();
            d.setDate(1);
            var selectedMonth = d.getMonth();
            // прибавление к месяцам смещено на +3, т.к. в массиве theMonth + 3 элемента вначале
            $scope.theMonth1 = theMonth[d.getMonth()+4];
            $scope.theMonth0 = theMonth[d.getMonth()+3];
            $scope.theMonth_1 = theMonth[d.getMonth()+2];
            $scope.theMonth_2 = theMonth[d.getMonth()+1];
            $scope.theMonth_3 = theMonth[d.getMonth()];
            // $scope.theYear = theYear[d.getFullYear()];
            $scope.theYear = d.getFullYear();

            $scope.theYear1 = (d.getFullYear()+1);
            $scope.theYear_1 = (d.getFullYear()-1);

            var countDays = new Date(selectedYear,selectedMonth+1,0).getDate();
            var calendar = [];
            var m = [
                {lg: 'Понедельник',sm: 'Пн'},
                {lg: 'Вторник',sm: 'Вт'},
                {lg: 'Среда',sm: 'Ср'},
                {lg: 'Четверг',sm: 'Чт'},
                {lg: 'Пятница',sm: 'Пт'},
                {lg: 'Суббота',sm: 'Сб'},
                {lg: 'Воскресенье',sm: 'Вс'}
            ];
            var tasks = {
                2: {
                    date: '2 МАРТА',
                    title:'Редкие книги 20',
                    city: 'В Никитском',
                    cl: 'active-blue'
                },
                17: {
                    date: '17 МАРТА',
                    title:'Редкие книги 4',
                    city: 'В Никитском',
                    cl: 'active-yellow'
                },
                19: {
                    date: '19 МАРТА',
                    title:'Редкие книги 3',
                    city: 'В Никитском',
                    cl: 'active-purple'
                }
            };
            var num = 0;
            var month = [];
            while(num<countDays){
                var week = [];
                for (var i = 0; i < 7; i++){
                    var calendarTemp = {};
                    if(calendar.length+1 > getWeekDay(d) && num < countDays){
                        num++;
                        var curD = new Date(+d.getTime());
                        curD.setDate(num);
                        calendarTemp = {
                            day : num,
                            string : m[i],
                            current : (
                                +currentDate.getFullYear()===+selectedYear &&
                                +currentDate.getMonth()===+selectedMonth &&
                                +currentDate.getDate()===+num
                            ),
                            old : (
                                +currentDate.getTime() > +curD.getTime()
                            ),
                            tasks : false
                        };
                        if(tasks[num]!=undefined){
                            calendarTemp.tasks=tasks[num];
                        }
                    }
                    week.push(calendarTemp);
                    calendar.push(calendarTemp);
                }
                month.push(week);
            }

            return calendar;
        }

        // месяцы начало
        // отобразить числа на сдедующий месяц
        $scope.nextMonth = function () {
            d.setMonth(d.getMonth() + 1);
            $scope.calendar = createCalendarForMonth();
        };
        // отобразить числа на предыдущий месяц
        $scope.previous1Month = function () {
            d.setMonth(d.getMonth() - 1);
            $scope.calendar = createCalendarForMonth();
        };
        // отобразить числа на предпредыдущий месяц
        $scope.previous2Month = function () {
            d.setMonth(d.getMonth() - 2);
            $scope.calendar = createCalendarForMonth();
        };
        // отобразить числа на предпредпредыдущий месяц
        $scope.previous3Month = function () {
            d.setMonth(d.getMonth() - 3);
            $scope.calendar = createCalendarForMonth();
        };
        // месяцы конец
        // год начало


        // отобразить числа на следующий год
        $scope.nextYear = function () {
            d.setFullYear(d.getFullYear() + 1);
            $scope.calendar = createCalendarForMonth();
        };
        
        // отобразить числа на этот год
        var dd = new Date;
        $scope.nowYear = dd.getFullYear();
        $scope.thisYear = function () {            
            d.setFullYear(dd.getFullYear());
            $scope.calendar = createCalendarForMonth();
        };
        // отобразить числа на предыдущий год
        $scope.previousYear = function () {
            d.setFullYear(d.getFullYear() - 1);
            $scope.calendar = createCalendarForMonth();
        };
        // год конец
        
        function getWeekDay(d) {
            return d.getDay()===0?6:d.getDay()-1;
        }

        $scope.open = $stateParams.open;
    }])
});