export class ResponseModel {
  responseCode!: string
  responseMessage!: string
  data!: any
}

export class SubFolderResponseModel {
  id!: number
  isFolder!: boolean
  name!: string
  extenstion!: null | string
  subfolder!: any
}


export class PaggingModel {
  totalElements!: number
  totalPage!: number
  result!: any
}

export class Files {
  fileName!: string
  fileObj!: string | undefined
  ownBy?: number | null
}
