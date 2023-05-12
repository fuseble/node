export const createGlobalHtml = (title?: string) => `
<style>
	button{
		width: auto;
		padding: 12px 20px;
		border-radius: 6px;
		background: transparent;
		border: 1px solid #333;
		cursor: pointer;
	}
</style>
<h1>${title || 'FUSEBLE Inc.'}</h1>
<div>
    <button onclick="goSwagger()">Swagger</button>
    <button style="margin-left: 12px;" onclick="goAdminJS()">AdminJS</button>
</div>
<script>
function handlePath(path){
    window.location.href = window.location.protocol + "//" + window.location.host + path;    
}

function goSwagger(){
    console.log('goSwagger');
    handlePath('/api-docs');
}

function goAdminJS(){
    console.log('goAdminJS');
    handlePath('/adminjs');
}
</script>

`;

export default createGlobalHtml;
