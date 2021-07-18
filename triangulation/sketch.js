function setup() {
	cn = createCanvas(800, 600);
	cn.position(0,0)
	cn.background(51)
}

var tocke = []
var povezave = []
var tring = []
var konvLupina = []

function minTring()
{
	for(var i = 0; i < tocke.length; i++)							//generate all links
	{
		for(var j = i+1; j < tocke.length; j++)
		{
			povezave.push([i,j])
		}
	}

	povezave.sort(sortPovezave)
	tring.push(povezave[0])
	qh()
	k = konvLupina.length-2

	i = 0
	while(i != povezave.length)									//goes trough all links and is adding them to tring array
	{
		tring.push(povezave[i])
		for(var j = 0; j < tring.length-1; j++)					
		{
			if(!presecisce(povezave[i],tring[j]))				//if you find a link that crosses another link in tring array, than throw it away
			{
				tring.pop()
				break;
			}
		}
		i++
	}
	print(povezave.length)
	print(tring.length)
	for(var i = 0; i < tring.length;i++)						//draw the lines
	{
		spawn_red_line(tring[i][0],tring[i][1])
	}
}

function tockeGen()												//point generator
{
	clearCan()
	tocke = []
	povezave = []
	tring = []
	konvLupina = []
	var n = document.getElementById("stTock").value
	for(var i = 0; i < n; i++)
	{
		tocke.push(createVector(Math.floor(Math.random()*800), Math.floor(Math.random()*600)))
		circle(tocke[i].x,tocke[i].y, 5)
	}
}

function sortPovezave(a, b)
{
	return evklid(a[0],a[1]) - evklid(b[0],b[1])
}	

function manhat(x, y)
{
	return Math.abs(tocke[x].x-tocke[y].x)+Math.abs(tocke[x].y-tocke[y].y)
}

function evklid(x,y)
{
	return Math.pow(tocke[x].x-tocke[y].x,2)+Math.pow(tocke[x].y-tocke[y].y,2)
}

function presecisce(pres1,pres2)	//alghoritem to check if two links cross each other
{
	var t1 = tocke[pres1[0]]
	var t2 = tocke[pres1[1]]
	var t3 = tocke[pres2[0]]
	var t4 = tocke[pres2[1]]
	var Ua
	var Ub
	var d = p5.Vector.cross(t2.copy().sub(t1), t4.copy().sub(t3)).z
	var a = p5.Vector.cross(t4.copy().sub(t3), t1.copy().sub(t3)).z
	var b = p5.Vector.cross(t2.copy().sub(t1),t1.copy().sub(t3)).z

	Ua = a/d
	Ub = b/d

	if (priblizno(d, 0) && priblizno(a, 0) && priblizno(b, 0)) {
		return false; 
	}
	if(priblizno(d,0))
	{
		return true
	}
	if(priblizno(Ua,1) || priblizno(Ua,0) || priblizno(Ub,1) || priblizno(Ub,0))
	{
		return true
	}
	if(Ua > 0 && Ua < 1 && Ub > 0 && Ub < 1 )
	{
		return false
	}

	return true


}

function qh()		//qucick-hull alghoritem to find the number of points in the convex shell, there is a bug that fails to connect last 2 dots together
{
	konvLupina = []
	var e1,e2
	var s1 = []
	var s2 = []
	for(var i = 0; i < tocke.length; i++)			//find the furthest dots
	{
		if(i == 0)
		{
			e1 = i
			e2 = i
		}
		
		if(tocke[e1].x < tocke[i].y)
		{
			e1 = i
		}
		if(tocke[e2].x > tocke[i].y)
		{
			e2 = i
		}
	}
	konvLupina.push(e1)
	konvLupina.push(e2)


	for(var i = 0; i < tocke.length;i++)		// split dots on left and right side of e1-e2 link
	{
		var v1 = createVector(tocke[e2].x-tocke[e1].x, tocke[e2].y-tocke[e1].y)
		var v2 = createVector(tocke[i].x-tocke[e1].x, tocke[i].y-tocke[e1].y)
		var lezi = v1.copy().cross(v2)
		if(lezi.z > 0 && (i != e1 || i != e2))
		{
			s1.push(i)
		}
		else if(lezi.z < 0 && (i != e1 || i != e2))
		{
			s2.push(i)
		}
	}

	qhsearch(e1,e2,s1)
	qhsearch(e2,e1,s2)
}

function qhsearch(a, b, array)					//does preatty much the same thing as in qh but without searching for the extremes but we also search a triangle
{												//with the bigges area and if there are more triangles with the same area we have to check the biggest angle
	if(array.length == 0)
	{
		return
	}
	var najTock
	var tproj
	for(var i = 0; i < array.length;i++)
	{

		var v1 = createVector(tocke[b].x-tocke[a].x, tocke[b].y-tocke[a].y)
		var vn = v1.copy().normalize()
		var v2 = createVector(tocke[array[i]].x-tocke[a].x, tocke[array[i]].y-tocke[a].y)
		var sp = vn.copy().dot(v2)
		if(sp >= 0 && sp <= v1.mag())
		{
			var tp = [parseInt(tocke[a].x)+parseInt(vn.x*sp),parseInt(tocke[a].y)+parseInt(vn.y*sp)]
			tproj = Math.sqrt(Math.pow(tp[0]-tocke[array[i]].x,2)+Math.pow(tp[1]-tocke[array[i]].y,2))
		}

		if(i == 0 || najTock[1] < tproj)
		{
			najTock = [array[i], tproj]
		}
	}
	var notInf = false
	for(var i = 0; i < konvLupina.length;i++)
	{
		if(notInf)
		{
			break;
		}
		if(konvLupina[i] == a)
		{
			konvLupina.splice(i,0,najTock[0])
			notInf = true
		}
	}

	array.slice(najTock[0],1)

	var s1 = []
	var s2 = []

	for(var i = 0; i < array.length; i++)
	{
		print(i)
		var v1 = createVector(tocke[a].x-tocke[najTock[0]].x, tocke[a].y-tocke[najTock[0]].y)
		var v2 = createVector(tocke[array[i]].x-tocke[najTock[0]].x, tocke[array[i]].y-tocke[najTock[0]].y)
		var lezi = v1.copy().cross(v2)
		if(lezi.z < 0)
		{
			s1.push(array[i])
		}
	}

	for(var i = 0; i < array.length; i++)
	{
		var v1 = createVector(tocke[b].x-tocke[najTock[0]].x, tocke[b].y-tocke[najTock[0]].y)
		var v2 = createVector(tocke[array[i]].x-tocke[najTock[0]].x, tocke[array[i]].y-tocke[najTock[0]].y)
		var lezi = v1.copy().cross(v2)
		if(lezi.z > 0)
		{

			s2.push(array[i])
		}
	}
	qhsearch(a,najTock[0],s1)
	qhsearch(najTock[0],b,s2)
}

function clearCan()
{
	clear()
	cn.background(51)
}

function priblizno(x,y)
{
	return abs(x - y) < 1e-9
}

function spawn_red_line(a,b)
{
	let c = color('red')
	stroke(c)
	line(tocke[a].x,tocke[a].y,tocke[b].x,tocke[b].y)
	c = color('black')
	stroke(c)
}

function spawn_red_circle(x)
{
	let c = color('red')
	stroke(c)
	circle(tocke[x][0],tocke[x][1],10)
	c = color('black')
	stroke(c)
}

function spawn_green_line(a,b)
{
	let c = color('green')
	stroke(c)
	line(tocke[a].x,tocke[a].y,tocke[b].x,tocke[b].y)
	c = color('black')
	stroke(c)
}

