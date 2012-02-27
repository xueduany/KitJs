<?xml   version= "1.0 "   encoding= "GB2312 "?>
<xsl:stylesheet   version= "1.0 "
xmlns:xsl= "http://www.w3.org/1999/XSL/Transform ">
	<!--   IE5   只接受
	<xsl:stylesheet   xmlns:xsl= "http://www.w3.org/TR/WD-xsl ">   -->
	<!--   IE5   看不懂   xsl:output   -->
	<xsl:output   encoding= "GB2312 "/>
	<xsl:template   match= "/ ">
		<html>
			<head>
				<title>产品搜寻结果</title>
			</head>
			<body>
				<h1>产品搜寻结果</h1>
				<p>
					<b>摘要：</b>
					<xsl:value-of   select= "*/摘要 "/>
				</p>
				<xsl:apply-templates   select= "产品搜寻 "/>
			</body>
		</html>
	</xsl:template>
	<xsl:template   match= "产品搜寻 ">
		<table>
			<tr>
				<th>品名</th>
				<th>定价</th>
				<th>说明页</th>
			</tr>
			<xsl:for-each   select= "产品 ">
				<tr>
					<td>
						<xsl:value-of   select= "品名 "/>
					</td>
					<td>
						<xsl:value-of   select= "定价 "/>
					</td>
					<td>
						<a   href= "{说明页/@网址} ">
							H
							<xsl:value-of   select= "说明页 "/>
						</a>
					</td>
					<!--   IE5   只接受   <td> <a> <xsl:attribute   name= "href ">
					<xsl:value-of   select= "说明页/@网址 "/>
					</xsl:attribute> <xsl:vsalue-of   select= "说明页 "/> </a> </td>   -->
				</tr>
			</xsl:for-each>
		</table>
	</xsl:template>
</xsl:stylesheet> 