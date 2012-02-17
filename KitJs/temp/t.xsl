<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<html>
			<head>
				<link rel="stylesheet" href="t.css"/>
			</head>
			<body>
				<div class="dict">
					<xsl:apply-templates/>
				</div>
			</body>
		</html>
	</xsl:template>
	<xsl:template match="n">
		<br />
	</xsl:template>
	<xsl:template match="Ë">
		<img src="{@M}" align="{@I}"/>
	</xsl:template>
	<xsl:template match="Ô">
		<div style="{@P}">
			<xsl:apply-templates/>
		</div>
	</xsl:template>
	<xsl:template match="Ã">
		<sup>
			<xsl:apply-templates/>
		</sup>
	</xsl:template>
	<xsl:template match="Y">
		<a href="{@O}">
			<xsl:value-of select="."/>
		</a>
	</xsl:template>
	<xsl:template match="Õ">
		<div style="color:#333;font-weight:bold">
			<xsl:apply-templates/>
		</div>
	</xsl:template>
	<xsl:template match="K">
		<xsl:value-of select="text()" disable-output-escaping="yes" />
	</xsl:template>
	<xsl:template match="x">
		<font color="{@K}" face="{@L}">
			<xsl:apply-templates/>
		</font>
	</xsl:template>
	<xsl:template match="*">
		<xsl:copy>
			<xsl:apply-templates/>
		</xsl:copy>
	</xsl:template>
</xsl:stylesheet>