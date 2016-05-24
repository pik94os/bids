define(['./module','jquery'],function(controllers,$){
    'use strict';
    controllers.controller('CalendarHeader',['$scope', '$stateParams', function($scope, $stateParams){
        $scope.open = $stateParams.open;
    }]).controller('Calendar',['$scope','$http', '$rootScope', '$stateParams', function($scope,$http,$rootScope,$stateParams){
        var d = new Date;
        $scope.calendar = createCalendarForMonth(d);
        $scope.currentDay = (new Date).getDate();
        function createCalendarForMonth(d) {
            var currentDate = new Date;
            var selectedYear = d.getFullYear();
            d.setDate(1);
            var selectedMonth = d.getMonth();
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

        function getWeekDay(d) {
            return d.getDay()===0?6:d.getDay()-1;
        }

        $scope.open = $stateParams.open;
    }])
});