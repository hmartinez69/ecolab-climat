import React, { Component } from 'react'
// import {findRuleByName} from '../engine/rules.js'
import {analyseSituation} from '../engine/traverse'
import './Rule.css'
import JSONTree from 'react-json-tree'
import R from 'ramda'
import PageTypeIcon from './PageTypeIcon'
import {connect} from 'react-redux'
import {formValueSelector} from 'redux-form'
import mockSituation from '../engine/mockSituation.yaml'

// situationGate function useful for testing :
let testingSituationGate = v => // eslint-disable-line no-unused-vars
	R.path(v.split('.'))(mockSituation)

@connect(state => ({
	situationGate: name => formValueSelector('conversation')(state, name)
}))
export default class Rule extends Component {
	render() {
		let {
			params: {name},
			situationGate
		} = this.props,
			rule = analyseSituation(
				situationGate
			).find(R.propEq('name', name))

		if (!rule) {
			this.props.router.push('/404')
			return null
		}

		return (
			<div id="rule">
				Pourquoi cette règle me concerne ? Comment est-elle calculée ?
				<PageTypeIcon type="comprendre"/>
				<h1>
					<span className="rule-type">{rule.type}</span>
					<span className="rule-name">{name}</span>
				</h1>
				<section id="rule-meta" style={{display: 'none'}}>
					<div id="meta-paragraph">
						<p>
							{rule.description}
						</p>
					</div>
					<div>
						<h2>Propriétés</h2>
						<JSONView o={{
							...rule.attributs,
							'contexte': rule['attache']
						}} />
						<h2>Références</h2>
						{this.renderReferences(rule)}
					</div>
				</section>
				<section id="rule-rules">
					{ do {
						let [,cond] =
							R.toPairs(rule).find(([,v]) => v.rulePropType == 'cond') || []
						cond != null &&
							<section id="declenchement">
								<h2>Conditions de déclenchement</h2>
								{cond.jsx}
							</section>
					}}
					<section id="formule">
						<h2>Calcul</h2>
						{rule['formule'].jsx}
					</section>
				</section>

				{/* <pre>
						<JSONView data={rule} />
				</pre> */}
			</div>
		)
	}

	renderReferences(rule) {
		return (
			rule['référence'] && <div>{rule['référence']}</div>)
		|| (
			rule['références'] && <ul id="rule-references">
				{R.toPairs(rule['références']).map(
					([name, link]) =>
						<li key={name}>
							{link.indexOf('legifrance.gouv') >= 0 &&
								<i className="fa fa-gavel" aria-hidden="true"></i>
							}
							<a href={link} target="_blank">
								{name}
							</a>
						</li>
				)}
			</ul>
		)
	}
}

let RuleProp = ({nodeValue, explanation, name}) =>
<div className="ruleProp node" >
	<div>
		<span className="name">{name}</span>
		<NodeValue data={nodeValue}/>
	</div>
	{
		explanation.category == 'mecanism' && <Mecanism {...explanation}/>
	}
</div>

let Mecanism = ({nodeValue, name, explanation}) =>
<div className="mecanism node" >
	<div>
		<span className="name">{name}</span>
		<NodeValue data={nodeValue}/>
	</div>
	{R.contains(name)(["l'une de ces conditions", 'toutes ces conditions']) &&
		<ul>
			{explanation.map(item => <li key={item.variableName + item.name}>
				{item.category == 'variable' ?
						<Variable {...item} />
					: item.category == 'comparison' ?
							<Comparison {...item} />
						: <Mecanism {...item} />
				}
			</li>)}
		</ul>
	}
	{name == 'multiplication' &&
		<Multiplication  {...explanation}/>
	}
	{name == 'le maximum de' &&
		<JSONView o={{nodeValue, name, explanation}} />
	}
</div>

let Multiplication = ({base, rate}) =>
<div className="multiplication node" >
		<Variable {...base}/>
		<span className="multiplicationSign">×</span>
		{
			rate.explanation ?
			<JSONView o={rate} />
			: <Percentage {...rate}/>
		}

</div>


let Variable = (yo) => do {
	let {nodeValue, variableName} = yo
;<span className="variable" >
	<span className="name">{variableName}</span>
	<NodeValue data={nodeValue}/>
</span>
}


let Comparison = ({nodeValue, text}) =>
<span className="comparison" >
	<span className="name">{text}</span>
	<NodeValue data={nodeValue}/>
</span>






let Percentage = ({percentage}) =>
<span className="rate" >
	<span className="name">{percentage}</span>
</span>



// let Formula = ({explanation, nodeValue}) => do {
// 	<div className="form node" >
// 		<div>
// 			<span className="name">{expression}</span>
// 			<NodeValue data={nodeValue}/>
// 		</div>
// 	</div>
// }

let JSONView = ({o, rootKey}) => (
	<div className="json">
		<JSONTree
			getItemString={() => ''}
			theme={theme}
			hideRoot={true}
			shouldExpandNode={() => true}
			data={rootKey ? {[rootKey]: o} : o}
		/>
	</div>
)



var theme =  {
	scheme: 'atelier forest',
	author: 'bram de haan (http://atelierbram.github.io/syntax-highlighting/atelier-schemes/forest)',
	base00: '#1b1918',
	base01: '#2c2421',
	base02: '#68615e',
	base03: '#766e6b',
	base04: '#9c9491',
	base05: '#a8a19f',
	base06: '#e6e2e0',
	base07: '#f1efee',
	base08: '#f22c40',
	base09: '#df5320',
	base0A: '#d5911a',
	base0B: '#5ab738',
	base0C: '#00ad9c',
	base0D: '#407ee7',
	base0E: '#6666ea',
	base0F: '#c33ff3'
}
