define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('CalendarHeader',['$scope', '$stateParams', function($scope, $stateParams){
        $scope.open = $stateParams.open;
    }]).controller('Calendar',['$scope','$http', '$rootScope', '$stateParams', function($scope,$http,$rootScope,$stateParams){
        var objectFunctions = {};
        //alert (  );
        var d = new Date;
        $scope.calendar = createCalendarForMonth(d);
        $scope.currentDay = (new Date).getDate();
        function createCalendarForMonth() {
            var currentDate = new Date;

            var theTheMonth = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
            $scope.theTheMonth = theTheMonth[currentDate.getMonth()+1];

            var selectedYear = d.getFullYear();
            d.setDate(1);

            // var selectedMonth;
            var selectedMonth = d.getMonth();
            //
            // if ( objectFunctions.length === 0 ) {
            //     selectedMonth = d.getMonth();
            // } else {
            //     selectedMonth = objectFunctions.month;
            // }

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
                        calendarTemp = {
                            day : num,
                            string : m[i],
                            current : (
                                currentDate.getFullYear()===selectedYear &&
                                currentDate.getMonth()===selectedMonth &&
                                currentDate.getDate()===num
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
        var theDate = new Date();
        var theMonth = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
        $scope.theMonth1 = theMonth[theDate.getMonth()+1];
        $scope.theMonth0 = theMonth[theDate.getMonth()];
        $scope.theMonth_1 = theMonth[theDate.getMonth()-1];
        $scope.theMonth_2 = theMonth[theDate.getMonth()-2];
        $scope.theMonth_3 = theMonth[theDate.getMonth()-3];
        $scope.theYear = theDate.getFullYear();

        $scope.previousMonth = function () {
            // createCalendarForMonth(currentDate.getMonth() - 1);
            var selectedMonthValue = d.getMonth() - 1;
            objectFunctions.month = selectedMonthValue;
        };
        $scope.nextMonth = function () {
            createCalendarForMonth(d.getMonth() + 1);
        };
        // месяцы конец

        function getWeekDay(d) {
            return d.getDay()===0?6:d.getDay()-1;
        }

        $scope.open = $stateParams.open;
    }])
});