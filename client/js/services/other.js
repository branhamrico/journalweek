angular
  .module("otherServices", [])
  .factory('Notification', ['$sce', function($sce){
    let timer = 4000;
    let notify = (message, from, align, type, icon) => {
      $.notify({
        icon: icon,
        message: message
      },{
        type: type,
        timer: timer,
        placement: {
            from: from,
            align: align
        }
      });
    };
    return {
      success: (message, from = 'top', align = 'right') => {
        notify(message, from, align, 'success', 'ti-check');
      },
      error: (message, from = 'top', align = 'right') => {
        notify(message, from, align, 'danger', 'ti-na');
      },
      warningDelete: (body, from = 'top', align = 'right') => {
        body = $sce.trustAsHtml(body);
        notify(body, from, align, 'warning');
      }
    };
  }]);
