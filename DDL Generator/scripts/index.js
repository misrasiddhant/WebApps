function InferSchema(){

	let re_float = RegExp(/\-?\d+\.\d+/g);

	let sample_data = document.getElementById("sample_data").value;
	let header = document.getElementById("header_data").value;
	let output_span = document.getElementById("schema");

	let table = document.createElement("TABLE");
	table.setAttribute("id", "ddl_table");
	
	output_span.innerHTML="";
	output_span.appendChild(table);

	let sep = document.getElementById("seperator").value;
	if(sep===""){
		sep=",";
	}
	//output_span.innerHTML="<table id='ddl_table'></table>";
	//table=document.getElementById("ddl_table");
	let sample_items = sample_data.split(sep);
	let columns = header.split(sep);

	let item;
	let col;
	for (let i = 0; i < sample_items.length; i++) {
		item = sample_items[i];
		col = columns[i];
		if (!isNaN(item)) {
			try {
				if (re_float.test(item)) {
					append(col, table, "FLOAT");
				} else {
					append(col, table, "INT");
				}
			} catch (e) {
				append(col, table, "STRING");
			}
		} else if (item === 'true' || item === 'false') {
			append(col, table, "BOOLEAN");
		} else {
			append(col, table, "STRING");
		}
	}
	
}
	
function append(index,obj,str){

	var tr = document.createElement("TR");
    obj.appendChild(tr);

	let td1 = document.createElement("TD");
	td1.innerHTML="<input name='column' type='text' value='"+index+"' />";
	tr.appendChild(td1);

	let td2 = document.createElement("TD");
	let sel = getDataTypeDropDown(str);
	td2.appendChild(sel);
	//td2.innerHTML="<input name='column' type='text' value='"+str+"' />";
	tr.appendChild(td2);

	let td3 = document.createElement("TD");
	td3.innerHTML="<input name='comment' type='text' placeholder='Comment' />";
	tr.appendChild(td3);
	
}

function getDataTypeDropDown(str){
	const select = document.createElement("SELECT");
	select.setAttribute("name", "dataType");

	const opt = ["TINYINT", "SMALLINT", "INT", "BIGINT", "BOOLEAN", "FLOAT", "DOUBLE", "DOUBLE PRECISION", "STRING", "BINARY", "TIMESTAMP", "DECIMAL", "DECIMAL(precision, scale)", "DATE", "VARCHAR", "CHAR"]
	let sel_index = 3;
	for(let j=0; j<opt.length; j++){
		const z = document.createElement("option");
		z.setAttribute("value", opt[j]);
		const t = document.createTextNode(opt[j]);
		z.appendChild(t);
		select.appendChild(z);
		if(opt[j]===str){
			sel_index=j;
		}
	}
	select.selectedIndex=sel_index;
	return select;
}

function determineDelimiter(obj){
	let regex_sep = /[~;,.:|]/g;
	let input = obj.value;
	let separators = input.match(regex_sep);
	let arr = new Map();
	let key;
	for (let i = 0; i < separators.length; i++) {
		key = separators[i];
		if (arr.has(key)) {
			arr.set(key, arr.get(key) + 1);
		} else {
			arr.set(key, 1);
		}
	}

	let max_val = 0;
	let sep = "";

	const iterator1 = arr[Symbol.iterator]();

	for (let item of iterator1) {
	  if(item[1]>max_val){
		  max_val=item[1];
		  sep=item[0];
	  }
	}

	document.getElementById("seperator").value=sep;
	
}

function toggle(element_id){

	let elem = document.getElementById(element_id);
	if(elem.style.display==='none'){
		elem.style.display='block';
	}else{
		elem.style.display='none';
	}
}