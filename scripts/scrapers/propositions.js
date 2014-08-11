// For use scraping propositions on http://nf4.netfile.com/pub2/?aid=sfo&AspxAutoDetectCookieSupport=1
// timing logic is a giant hack, but it works reasonably well

var getData = function () {
  console.log('11/04');
  $('div:contains("11/04/2014 General Election").rtMid')
  .closest('.rtLI')
  .find('[href^=AllFilingsByMeasure]')
  .each(function () {
     console.log($(this).text());
    $(this)
      .closest('.rtLI')
      .find('[href^=AllFilingsByFiler]')
      .each(function () {
        console.log('>' + $(this).text());
      });
  })
  console.log('06/03');
  $('div:contains("06/03/2014 Primary Election").rtMid')
  .closest('.rtLI')
  .find('[href^=AllFilingsByMeasure]')
  .each(function () {
     console.log($(this).text());
    $(this)
      .closest('.rtLI')
      .find('[href^=AllFilingsByFiler]')
      .each(function () {
        console.log('>' + $(this).text());
      });
  })
};


var urlTemp = '//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js';
(function(){ var url = urlTemp; var _my_script=document.createElement('script'); _my_script.type='text/javascript';  _my_script.src= url + '?' + (Math.random());  document.getElementsByTagName('head')[0].appendChild(_my_script);  })();

setTimeout(function () {
  $('.rtPlus').click();
  setTimeout(function () {
    $('.rtPlus').click();
    setTimeout(function () {
      getData();
    }, 10000);
  }, 2000);
}, 2000);
