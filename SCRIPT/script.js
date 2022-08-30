const FAKE_COVERS = [
	'https://t3.ftcdn.net/jpg/02/49/37/86/360_F_249378634_OxdxhGcROdOPnEL6ESAVdfbsxp8COfsd.jpg',
	'http://2.bp.blogspot.com/-f7BIZsV_GeU/TybLEisjvCI/AAAAAAAABK4/sCgXCk84LmI/s1600/LIBRO-DE-ORO-DEL-FUTBOL-MEXICANO.jpg',
	'https://http2.mlstatic.com/D_NQ_NP_896391-MLM43147579283_082020-W.jpg',
	'https://cultura.nexos.com.mx/wp-content/uploads/2019/12/libros.jpg',
	'http://wmagazin.com/wp-content/uploads/2020/11/Mexico-Daniel-Saldana-Paris-Elnervioprincipal-WMagazin.jpg',
	'https://http2.mlstatic.com/D_NQ_NP_887930-MLM27356364508_052018-O.jpg',
	'https://cdn1.matadornetwork.com/blogs/2/2020/04/retrato-libros-sabiduria-indigena-560x420.jpg',
	'https://wmagazin.com/wp-content/uploads/2020/12/HA-ppal-SocorroVenegas-e1607861899224.jpg',
	'https://d3tvwjfge35btc.cloudfront.net/Assets/43/082/L_p0126908243.jpg',
	'https://s3.gomedia.us/wp-content/uploads/2018/02/3.png',
	'https://imusic.b-cdn.net/images/item/original/098/9786073807098.jpg'
];
const MAX_ITEMS_PER_PAGE = 4;

var DATA_DEFAULT = [];
var DATA_FILTERED = [];
var PAGE = 0;

const DOMReady = (callback) => {
	if (document.readyState === 'interactive' || document.readyState === 'complete') {
		callback();
	} else if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', callback);
	} else if (document.attachEvent) {
		document.attachEvent('onreadystatechange', function() {
			if (document.readyState != 'loading') {
				callback();
			}
		});
	}
};

const randomCover = () => {
	let rand = Math.random() * FAKE_COVERS.length;
	rand = Math.floor(rand);

	return FAKE_COVERS[rand];
}

const createFullScreenBlock = ( file ) => {
	let block = $(`<div class="full_screen_pdf_viewer"><object data="your_url_to_pdf" type="application/pdf"><iframe src="${ file }"></iframe></object></div>`);
	$('body').append( block );

	block.fadeOut( 0 ).fadeIn();
}


const buildBookCard = ( book ) => {
	let author_full_name = `${ book.author_lastname_1 } ${ book.author_lastname_2 } ${ book.author_name_1 } ${ book.author_name_2 }`.trim();

	return $(`
	<div class='card book' data-file='${ book.url }'>
		<div class='card-header'>
			<img src='${ randomCover() }' alt='book-cover'/>
		</div>
		<div class='card-body'>
			<span class='tag tag-teal'>Tematica: ${ book.main_topic }</span>
			<h4 style='margin-top: 8px;'>${ book.title }</h4>
			<p style='margin-top: 8px;'>
				Coleccion: ${ book.collection }
			</p>
		</div>
	</div>
	`);
}

const loadDefaultData = () => {
	$.ajaxSetup({
		scriptCharset: "utf-8",
		contentType: "application/json; charset=utf-8"
	});

	let result = [];

	$.ajax({
		dataType: "json",
		url: "DATA/books.json",
		success: ( response ) => {
	  		response.map( (item, index) => {
	  			result = $.merge( result, item.books );
	  		});
	  	},
	  	error: ( error ) => {
	  		console.log( 'CRITICAL ERROR' );
	  		console.log( error );
	  	},
	  	complete: ( data ) => {
	  		DATA_DEFAULT = result;

	  		reloadBooks();
	  	}
	});
}

const buildPages = () => {
	$("#page_container").empty();
	let pages = Math.ceil( DATA_FILTERED.length / MAX_ITEMS_PER_PAGE );

	for (let i=0; i < pages; i++) {
		let dot = $(`<div class="dot" data-page="${ i }"></div>`);
		$("#page_container").append( dot );
	}
}

const updateCurrentPage = ( target_page ) => {
	PAGE = target_page;

	$("#book_container").empty();

	let start_index = target_page * MAX_ITEMS_PER_PAGE;
	let end_index = start_index + MAX_ITEMS_PER_PAGE;
	let paginated_data = DATA_FILTERED.slice( start_index, end_index );

	paginated_data.map( (item, index) => {
		$("#book_container").append( buildBookCard( item ) );
	});

	let pages = Math.ceil( DATA_FILTERED.length / MAX_ITEMS_PER_PAGE );
	$("#page_label").text( `Página ${ PAGE + 1 } de ${ pages }` );
}

const reloadBooks = () => {
	$("#page_container").empty();

	let filter = $('#search').val();
	filter = `${ filter }`.trim().toLowerCase();

	if ( filter.length > 0) {
		DATA_FILTERED = DATA_DEFAULT.filter( ( book ) => {
			let author_full_name = `${ book.author_lastname_1 } ${ book.author_lastname_2 } ${ book.author_name_1 } ${ book.author_name_2 }`.trim();
			let title_contains_filter = book.title.toLowerCase().indexOf( filter ) >= 0;
			let author_contains_filter = author_full_name.toLowerCase().indexOf( filter ) >= 0;

			return author_contains_filter || title_contains_filter;
		});
	}
	else {
		DATA_FILTERED = DATA_DEFAULT;
	}

	buildPages();
	updateCurrentPage( 0 );
}

const buildSearchResult = ( book ) => {
	let author_full_name = `${ book.author_lastname_1 } ${ book.author_lastname_2 } ${ book.author_name_1 } ${ book.author_name_2 }`.trim();

	return $(`
	<div class='search_result'>
		<h2 style='color: black'>${ book.title }</h2>
		<a style='cursor: pointer;' href='${ book.url }'/>${ book.url }</a>
		<div style="display: flex; flex-direction: row;">
			<label>${ book.institution }</label>
			<label style='margin-left: 20px;'>${ book.collection }</label>
		</div>
		<label style="font-weight: bold;">${ author_full_name }</label>
		<div style="display: flex; flex-direction: row;">
			<label>${ book.document_type }</label>
			<label style='margin-left: 20px;'>${ book.year }</label>
		</div>
	</div>
	`);
}

const getFilteredResults = () => {
	$('#search_results').empty();

	let filter = $('#search').val();
	filter = `${ filter }`.trim().toLowerCase();

	if ( filter.length > 0) {
		let filtered = DATA_DEFAULT.filter( ( book ) => {
			let author_full_name = `${ book.author_lastname_1 } ${ book.author_lastname_2 } ${ book.author_name_1 } ${ book.author_name_2 }`.trim();
			let title_contains_filter = book.title.toLowerCase().indexOf( filter ) >= 0;
			let author_contains_filter = author_full_name.toLowerCase().indexOf( filter ) >= 0;

			return author_contains_filter || title_contains_filter;
		});

		$('#search_section').fadeIn();

		filtered.map( (item, index) => {
			$("#search_results").append( buildSearchResult( item ) );
		});
	}
	else {
		$('#search_section').fadeOut();
	}
}

$(document).on( 'blur', '#search', getFilteredResults);

$(document).on( 'click', '.full_screen_pdf_viewer', ( ev ) => {
	let target = $( ev.currentTarget );
	target.fadeOut(300, () => {
		$(this).remove();

		$('html, body').css({
		    overflow: ''
		});
	});
});

$(document).on( 'click', '.book', ( ev ) => {
	let target = $( ev.currentTarget );
	let url = target.data( 'file' );

	$('html, body').css({
	    overflow: 'hidden'
	});

	createFullScreenBlock( url );
});

$(document).on( 'click', '.dot', ( ev ) => {
	let target = $( ev.currentTarget );
	let index = parseInt( target.data( 'page' ), 10 );

	updateCurrentPage( index );
});

DOMReady(async function() {
	loadDefaultData();
});
