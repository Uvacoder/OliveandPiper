!function(){function isjQuerySufficient(){var versions=jQuery.fn.jquery.split(".");return 1==versions[0]&&versions[1]>=6||versions[0]>1}return"undefined"==typeof jQuery?(console.error("jQuery is required for TagTray to operate."),!0):void jQuery(window).load(function(){return isjQuerySufficient()?(window.TagTray=TagTrayCore,TagTrayCore.checkForInitialPopupRequest(),TagTrayCore.renderGalleries(),void(TagTrayCore.isResponsiveGallery()&&jQuery(window).resize(function(){TagTray.fixResponsiveHeight()}))):(window.console&&console.error("At least jQuery v1.6.1 is required for TagTray to operate -- found v"+jQuery.fn.jquery),!0)})}(),TagTrayCore=new function(){function renderGallery(gallery){var $gallery=jQuery(gallery),galleryCode=$gallery.data("galleryCode");jQuery(".tagtray-gallery").trigger("show.tt.gallery"),TagTrayCore.init($gallery.data()),TagTrayCore.displayGallery(galleryCode,$gallery)}var hostname=window.location.hostname,isDevCall=hostname.indexOf("tagtray.dev")>-1,devHostname="//"+hostname+(location.port?":"+location.port:"")+"/",BASE_URL=isDevCall?devHostname:"//www.tagtray.com/",CDN_URL=isDevCall?devHostname:"//api.tagtray.com/",STYLESHEET=CDN_URL+"v2/tagtray.css",CONTENT_URL=BASE_URL+"gallery/displayGallery/code/",ROOT="tag_tray_gallery_",LOADING_IMAGE="tag_tray_loading_image_",layoutType="fixed",imageWidth=150,imageHeight=150,imageMargin=10,columnsPerRow=0,pageSize=20,maxNumPages=0,displayPagination="top",hideSourceIcon=!1,clickAction="tagtray",linkPopupToSource=!1,paginationType="updown",prevText="<",nextText=">",loadMoreText="LOAD MORE",gridOptions="tagtray-col-xs-6 tagtray-col-sm-3 tagtray-col-md-3 tagtray-col-lg-2",productId=0,wrapGalleryCss="",wrapPhotoCss="",onRender=null,onPaginate=null,siteLogos=[];siteLogos[1]=CDN_URL+"img/logos/facebook-tiny.png",siteLogos[2]=CDN_URL+"img/logos/instagram-tiny.png",siteLogos[3]=CDN_URL+"img/logos/twitpic-tiny.png",siteLogos[4]=CDN_URL+"img/logos/s3-tiny.png",siteLogos[5]=CDN_URL+"img/logos/twitter-tiny.png";var videoLogo=CDN_URL+"img/logos/video-tiny.png";this.renderGalleries=function(){var $galleries=jQuery(".tagtray-gallery");$galleries.length>0&&$galleries.each(function(i,gallery){renderGallery(gallery)})},this.requestStylesheet=function(stylesheet_url){stylesheet=document.createElement("link"),stylesheet.rel="stylesheet",stylesheet.type="text/css",stylesheet.href=stylesheet_url,stylesheet.media="all",document.getElementsByTagName("head")[0].appendChild(stylesheet)},this.requestContent=function(galleryCode,pageNum){var url=CONTENT_URL+galleryCode+"/page_num/"+pageNum+"/page_size/"+pageSize+"/product_id/"+productId+"?api_version=2&url="+encodeURIComponent(document.URL);jQuery.ajax({type:"GET",url:url,async:!1,jsonpCallback:"TagTrayCore.serverResponse",contentType:"application/json",dataType:"jsonp"})},this.parseServerResponse=function(data){var galleryCode=data.gallery_code,totalPages=maxNumPages>0?Math.min(maxNumPages,data.total_pages):data.total_pages,pageNum=data.page_num,forProductId=void 0!==data.product_id&&0!==data.product_id?data.product_id:0,div=document.getElementById(ROOT+galleryCode),headerTxt="",galleryTxt="",footerTxt="",pagination="",pageBackLink="javascript:TagTrayCore.pageBackward('"+galleryCode+"');",pageForwardLink="javascript:TagTrayCore.pageForward('"+galleryCode+"');";"updown"==paginationType?(pagination+='<div id="tag_tray_pagination_section_'+galleryCode+'" class="TagTrayPaginationSection TagTrayPaginationSectionTop">',pagination+='<a href="'+pageBackLink+'" class="tag-tray-page-back-link"> '+prevText+" </a>",pagination+='<span id="tag_tray_pagination_label'+galleryCode+'" class="TagTrayPaginationLabel">'+pageNum+" / "+totalPages+"</span>",pagination+='<a href="'+pageForwardLink+'" class="tag-tray-page-forward-link"> '+nextText+" </a>",pagination+="</div>"):"more"==paginationType&&(pagination+='<div id="tag_tray_pagination_section_'+galleryCode+'" class="TagTrayPaginationSection">',pagination+='<a href="'+pageForwardLink+'" class="tag-tray-page-more-link"> '+loadMoreText+" </a>",pagination+="</div>"),("top"==displayPagination||"both"==displayPagination)&&totalPages>1&&(headerTxt+=pagination),headerTxt+='<input type="hidden" id="tag_tray_'+galleryCode+'_page_num" value="'+pageNum+'">',headerTxt+='<input type="hidden" id="tag_tray_'+galleryCode+'_total_pages" value="'+totalPages+'">';var isResponsive=TagTrayCore.isResponsiveGallery();data=data.data;var imageClass="TagTrayTaggedImage";imageClass+=""===wrapPhotoCss?"":" "+wrapPhotoCss;var galleryClass=isResponsive?"TagTrayGalleryImages tagtray-container-fluid":"TagTrayGalleryImages";galleryClass+=""===wrapGalleryCss?"":" "+wrapGalleryCss,galleryTxt+='<div id="tag_tray_images_section_'+galleryCode+'" class="'+galleryClass+'">',galleryTxt+=isResponsive?'<div class="tagtray-row">':"";for(var i=0;i<data.length;i++){var targetUrl=data[i].photo_link_url,linkMeta="",theTitle=TagTrayCore.escapeHTML(data[i].photo_message),disableOverlays=3==data[i].site_id;"tagtray"!=clickAction||disableOverlays||(linkMeta='rel="tt_gallery" title="'+theTitle+'"',targetUrl=BASE_URL+"showcase/photoBox/id/"+data[i].id+"?url="+encodeURIComponent(document.URL)),0!==forProductId&&(targetUrl+="&productId="+encodeURIComponent(forProductId));var imageSourceUrl=isResponsive||imageWidth>=200?data[i].photo_small_image_url:data[i].photo_thumbnail_url;"https:"==window.location.protocol&&(imageSourceUrl=TagTrayCore.convertUrlToHttps(imageSourceUrl));var thisRightMargin=columnsPerRow>0&&(i+1)%columnsPerRow===0?0:imageMargin,imageWrapperStyle="",imageStyle="";isResponsive?(galleryTxt+='<div class="'+gridOptions+'" style="margin-bottom:20px;">',imageStyle="width: 100%",imageWrapperStyle="width: 100%"):(imageWrapperStyle="width:"+imageWidth+"px;height:"+imageHeight+"px;position:relative;cursor:pointer;margin:0px "+thisRightMargin+"px "+imageMargin+"px 0px",imageStyle="height:"+imageHeight+"px");var imgClass=data[i].video_link_url?" TagTrayTaggedImageVideo":"";galleryTxt+='<div class="'+imageClass+'" style="'+imageWrapperStyle+'" data-photo-id="'+data[i].id+'"><a href="'+targetUrl+'" '+linkMeta+' data-photo-id="'+data[i].id+'" data-tt-source-url="'+data[i].photo_link_url+'" class="TagTrayImageLink"><img src="'+imageSourceUrl+'" class="'+imgClass+'" style="'+imageStyle+'" data-photo-id="'+data[i].id+'" onerror="TagTrayCore.handleImageError(jQuery(this), \''+galleryCode+"');\"></a>",hideSourceIcon||(galleryTxt+='<div class="TagTraySocialIconOverlay" style="position:absolute; bottom:3px; left:3px; z-index:255;"><img src="'+siteLogos[data[i].site_id]+'" style="width:25px; height: 25px;"></div>'),data[i].video_link_url&&(galleryTxt+='<div class="TagTrayVideoIconOverlay" style="position:absolute; bottom:3px; right:3px; z-index:255;"><img src="'+videoLogo+'" style="width:25px; height: 25px;"></div>'),galleryTxt+="</div>",galleryTxt+=isResponsive?"</div>":""}if(galleryTxt+=isResponsive?"</div>":"",galleryTxt+="</div>",("bottom"==displayPagination||"both"==displayPagination)&&totalPages>1&&(pagination=pagination.replace("TagTrayPaginationSectionTop","TagTrayPaginationSectionBottom"),footerTxt+=pagination),"more"==paginationType&&pageNum>1){if(div.innerHTML+=galleryTxt,"bottom"==displayPagination||"top"==displayPagination&&pageNum>=totalPages){var paginationDiv=document.getElementById("tag_tray_pagination_section_"+galleryCode);paginationDiv.parentNode.removeChild(paginationDiv)}"bottom"==displayPagination&&totalPages>pageNum&&(div.innerHTML+=footerTxt);var pageNumField=document.getElementById("tag_tray_"+galleryCode+"_page_num");pageNumField.value=pageNum}else div.innerHTML=headerTxt+galleryTxt+footerTxt;return div},this.handleImageError=function($img,galleryCode){window.console&&console.log("Error occurred loading image-- removing from DOM:"+$img.attr("src")),$img.parent().parent().remove(),jQuery.ajax({type:"GET",dataType:"jsonp",url:BASE_URL+"/api/registerBadImage/id/"+$img.data("photoId")}),jQuery("#"+ROOT+galleryCode).trigger("error.tt.image")},this.init=function(params){void 0!==params&&(void 0!==params.layoutType&&(layoutType=params.layoutType),void 0!==params.imageWidth&&(imageWidth=params.imageWidth),void 0!==params.imageHeight&&(imageHeight=params.imageHeight),void 0!==params.imageMargin&&(imageMargin=params.imageMargin),void 0!==params.columnsPerRow&&(columnsPerRow=params.columnsPerRow),void 0!==params.pageSize&&(pageSize=Math.min(params.pageSize,30)),void 0!==params.maxNumPages&&(maxNumPages=params.maxNumPages),void 0!==params.displayPagination&&(displayPagination=params.displayPagination),void 0!==params.paginationType&&(paginationType=params.paginationType),void 0!==params.hideSourceIcon&&(hideSourceIcon=params.hideSourceIcon),void 0!==params.clickAction&&(clickAction=params.clickAction),void 0!==params.linkPopupToSource&&(linkPopupToSource=params.linkPopupToSource),void 0!==params.onRender&&(onRender=params.onRender),void 0!==params.onPaginate&&(onPaginate=params.onPaginate),void 0!==params.nextText&&(nextText=params.nextText),void 0!==params.prevText&&(prevText=params.prevText),void 0!==params.loadMoreText&&(loadMoreText=params.loadMoreText),void 0!==params.gridOptions&&(gridOptions=params.gridOptions),void 0!==params.productId&&(productId=params.productId),void 0!==params.wrapGalleryCss&&(wrapGalleryCss=params.wrapGalleryCss),void 0!==params.wrapPhotoCss&&(wrapPhotoCss=params.wrapPhotoCss),void 0!==params.iconFacebookUrl&&(siteLogos[1]=params.iconFacebookUrl),void 0!==params.iconInstagramUrl&&(siteLogos[2]=params.iconInstagramUrl),void 0!==params.iconTwitpicUrl&&(siteLogos[3]=params.iconTwitpicUrl),void 0!==params.iconUploadUrl&&(siteLogos[4]=params.iconUploadUrl),void 0!==params.iconTwitterUrl&&(siteLogos[5]=params.iconTwitterUrl))},this.displayGallery=function(galleryCode,$gallery){this.serverResponse=function(data){if(data&&data.gallery_code){var div=TagTrayCore.parseServerResponse(data),loadingImage=document.getElementById(LOADING_IMAGE+data.gallery_code);null!==loadingImage&&(loadingImage.style.display="none"),$div=jQuery(div),$div.fadeIn("fast",function(){TagTrayCore.isResponsiveGallery()&&TagTrayCore.fixResponsiveHeight()}),jQuery("#"+ROOT+data.gallery_code).trigger("shown.tt.gallery",[data.data.length]),"tagtray"==clickAction&&TagTrayCore.isUsingFancybox()&&jQuery(".TagTrayImageLink").fancybox(TagTrayCore.getAppropriateFancyboxInit())}},this.requestStylesheet(STYLESHEET),$gallery.html("<div id='"+ROOT+galleryCode+"' class='TagTrayImageBlock' style='display: none'></div><div id='"+LOADING_IMAGE+galleryCode+"' class='TagTrayAjaxLoadImage'><img src='//www.tagtray.com/img/ajax-load.gif'></div>"),this.requestContent(galleryCode,0)},this.getAppropriateFancyboxInit=function(){var width=jQuery(window).width();return 568>=width?this.getMobileFancyboxInit():this.getDefaultFancyboxInit()},this.getMobileFancyboxInit=function(){return{type:"iframe",scrolling:"auto",wrapCSS:"fancybox-tagtray-mobile",autoSize:!1,minWidth:240,width:800,height:535,margin:[20,20,0,20],padding:8,helpers:{title:null,thumbs:{width:60,height:60,source:function(el){return jQuery(el.element).find("img").first().attr("src")}}},titleShow:!1,afterLoad:TagTrayCore.trackView}},this.getDefaultFancyboxInit=function(){return{type:"iframe",scrolling:"auto",wrapCSS:"fancybox-tagtray",autoSize:!1,width:800,height:535,margin:[20,60,20,60],helpers:{title:null},titleShow:!1,afterLoad:TagTrayCore.trackView}},this.pageForward=function(galleryCode){this.flipPage(galleryCode,!0)},this.pageBackward=function(galleryCode){this.flipPage(galleryCode,!1)},this.flipPage=function(galleryCode,isFlippingForward){var pageNumField=document.getElementById("tag_tray_"+galleryCode+"_page_num");currentPageNum=parseInt(pageNumField.value);var numPagesField=document.getElementById("tag_tray_"+galleryCode+"_total_pages");numPages=parseInt(numPagesField.value),newPageIndex=0,newPageIndex=isFlippingForward?numPages>currentPageNum?currentPageNum:0:currentPageNum>1?currentPageNum-2:numPages-1,this.serverResponse=function(data){if(data&&data.gallery_code){{TagTrayCore.parseServerResponse(data)}TagTrayCore.isResponsiveGallery()&&TagTray.fixResponsiveHeight(),jQuery("#"+ROOT+data.gallery_code).trigger("flip.tt.page")}},this.requestContent(galleryCode,newPageIndex)},this.inkFileUploaded=function(event){$target=jQuery(event.target);var galleryCode=$target.data("ttGalleryCode"),onSuccessBlock=$target.data("ttOnSuccessBlock"),isShowingForm=$target.data("ttCollectInfo");onSuccessBlock&&jQuery(onSuccessBlock).first().show(),isShowingForm?(jQuery(onSuccessBlock+" input[name='key']").val(event.fpfile.key),jQuery(onSuccessBlock+" input[name='gallery_code']").val(galleryCode),jQuery(onSuccessBlock+" input[name='redirect_to']").val(document.URL)):TagTrayCore.registerInkUpload(galleryCode,event.fpfile.key),jQuery($target[0].parentElement).hide()},this.registerInkUpload=function(galleryCode,key){TagTrayCore.isUsingjQuery()?jQuery.ajax({type:"GET",dataType:"jsonp",url:BASE_URL+"/api/registerInkUpload?gallery_code="+galleryCode+"&key="+key}):console.log("Unable to register Ink upload: jQuery not found.")},this.checkForInitialPopupRequest=function(){if(TagTrayCore.isUsingFancybox()){var photoboxUrl=this.getQueryVariable("ttPhotoboxUrl");if(photoboxUrl){photoboxUrl=decodeURIComponent(photoboxUrl);var fbConfig=TagTrayCore.getDefaultFancyboxInit();jQuery.fancybox.open({href:photoboxUrl},fbConfig)}}},this.trackView=function(current,previous){if(current){var $element=current.element;$element instanceof jQuery||($element=jQuery($element)),$img=$element.find("img:first");var photoId=$img.attr("data-photo-id"),isTrigger=previous?0:1;jQuery.ajax({type:"GET",dataType:"jsonp",url:BASE_URL+"api/registerPhotoView?photo_id="+photoId+"&trigger="+isTrigger})}else window.console&&console.log("Unable to fire TagTray tracking call: Invalid fancyBox event!")},this.fixResponsiveHeight=function(){jQuery(".TagTrayGalleryImages .tagtray-row .TagTrayTaggedImage").each(function(){var width=jQuery(this).width();400>width?jQuery(this).css("height",width+"px"):jQuery(this).css("height","100%")})},this.isUsingjQuery=function(){return jQuery?!0:!1},this.isUsingShadowbox=function(){return"undefined"!=typeof Shadowbox},this.isUsingFancybox=function(){return jQuery().fancybox?!0:!1},this.refreshShadowbox=function(){this.isUsingShadowbox()&&(Shadowbox.clearCache(),Shadowbox.setup())},this.getQueryVariable=function(variable){for(var query=window.location.search.substring(1),vars=query.split("&"),i=0;i<vars.length;i++){var pair=vars[i].split("=");if(pair[0]==variable)return pair[1]}},this.escapeHTML=function(s){return s.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")},this.convertUrlToHttps=function(s){return s.replace("http:","https:")},this.isResponsiveGallery=function(){return"responsive"===layoutType}};
